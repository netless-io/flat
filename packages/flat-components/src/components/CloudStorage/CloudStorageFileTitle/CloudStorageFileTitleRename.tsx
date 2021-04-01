import checkSVG from "./icons/check.svg";
import crossSVG from "./icons/cross.svg";

import { Button, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { CloudStorageFileName } from "../types";

export interface CloudStorageFileTitleRenameProps {
    fileUUID: string;
    fileName: string;
    /** Rename file. Empty name for cancelling */
    onRename?: (fileUUID: string, fileName?: CloudStorageFileName) => void;
}

export const CloudStorageFileTitleRename = React.memo<CloudStorageFileTitleRenameProps>(
    function CloudStorageFileTitleRename({ fileUUID, fileName, onRename }) {
        // Antd docs uses any
        const inputRef = useRef<any>();
        const [oldName, ext] = splitFileName(fileName);
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
                    onRename(fileUUID, { name, ext, fullName });
                }
            });

        useEffect(() => {
            const input: Input = inputRef.current;
            if (input) {
                input.focus();
                input.select();
            }
        }, []);

        return (
            <>
                <Input
                    ref={inputRef}
                    size="small"
                    className="cloud-storage-file-title-rename-input"
                    value={name}
                    onChange={e => setText(e.currentTarget.value)}
                    onPressEnter={onConfirm}
                />
                <Button
                    type="text"
                    shape="circle"
                    size="small"
                    className="cloud-storage-file-title-rename-btn"
                    onClick={onConfirm}
                >
                    <img src={checkSVG} width={22} height={22} alt="confirm" />
                </Button>
                <Button
                    type="text"
                    shape="circle"
                    size="small"
                    className="cloud-storage-file-title-rename-btn"
                    onClick={onCancel}
                >
                    <img src={crossSVG} width={22} height={22} alt="cancel" />
                </Button>
            </>
        );
    },
);

/** split filename to name and extension */
function splitFileName(fileName: string): [string, string] {
    const dotIndex = fileName.lastIndexOf(".");
    return [fileName.substr(0, dotIndex), fileName.slice(dotIndex)];
}
