import checkSVG from "./icons/check.svg";
import crossSVG from "./icons/cross.svg";

import { Button, Input, InputRef, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { CloudStorageFileName } from "../types";
import { FileResourceType, ResourceType } from "@netless/flat-server-api";
import { checkInvalidDirectoryName } from "./utils";
import { useTranslate } from "@netless/flat-i18n";

export interface CloudStorageFileTitleRenameProps {
    fileUUID: string;
    fileName: string;
    fileResourceType?: ResourceType;
    /** Rename file. Empty name for cancelling */
    onRename?: (fileUUID: string, fileName?: CloudStorageFileName) => void;
}

export const CloudStorageFileTitleRename =
    /* @__PURE__ */ React.memo<CloudStorageFileTitleRenameProps>(
        function CloudStorageFileTitleRename({ fileUUID, fileName, fileResourceType, onRename }) {
            // Antd docs uses any
            const t = useTranslate();
            const inputRef = useRef<any>();
            const [oldName, ext] = splitFileName(fileName, fileResourceType);
            const [name, setText] = useState(oldName);

            const onCancel = onRename && (() => onRename(fileUUID));
            const onConfirm =
                onRename &&
                (() => {
                    const fullName = name + ext;
                    if (!name || fullName === fileName) {
                        // cancel on empty and same name
                        onRename(fileUUID);
                    } else {
                        if (fileResourceType === FileResourceType.Directory) {
                            checkInvalidDirectoryName(name)
                                ? message.error(t("invalid-directory-name-tips"))
                                : onRename(fileUUID, { name, ext, fullName });
                        } else {
                            onRename(fileUUID, { name, ext, fullName });
                        }
                    }
                });

            useEffect(() => {
                const input: InputRef = inputRef.current;
                if (input) {
                    input.focus();
                    input.select();
                }
            }, []);

            return (
                <>
                    <Input
                        ref={inputRef}
                        className="cloud-storage-file-title-rename-input"
                        size="small"
                        value={name}
                        onChange={e => setText(e.currentTarget.value)}
                        onPressEnter={onConfirm}
                    />
                    <Button
                        className="cloud-storage-file-title-rename-btn"
                        shape="circle"
                        size="small"
                        type="text"
                        onClick={onConfirm}
                    >
                        <img alt="confirm" height={22} src={checkSVG} width={22} />
                    </Button>
                    <Button
                        className="cloud-storage-file-title-rename-btn"
                        shape="circle"
                        size="small"
                        type="text"
                        onClick={onCancel}
                    >
                        <img alt="cancel" height={22} src={crossSVG} width={22} />
                    </Button>
                </>
            );
        },
    );

/** split filename to name and extension */
function splitFileName(fileName: string, fileResourceType?: ResourceType): [string, string] {
    if (fileResourceType === FileResourceType.Directory) {
        return [fileName, ""];
    }
    const dotIndex = fileName.lastIndexOf(".");
    return [fileName.substr(0, dotIndex), fileName.slice(dotIndex)];
}
