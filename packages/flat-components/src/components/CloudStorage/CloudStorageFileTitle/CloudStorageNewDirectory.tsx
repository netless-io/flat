import checkSVG from "./icons/check.svg";
import crossSVG from "./icons/cross.svg";

import { Button, Input, InputRef, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { DirectoryInfo } from "../../../containers/CloudStorageContainer";
import { checkInvalidDirectoryName } from "./utils";
import { useTranslate } from "@netless/flat-i18n";

export interface CloudStorageNewDirectoryProps {
    parentDirectoryPath: string;
    onNewDirectory?: (directoryInfo: DirectoryInfo) => void;
}

export const CloudStorageNewDirectory = /* @__PURE__ */ React.memo<CloudStorageNewDirectoryProps>(
    function CloudStorageNewDirectory({ parentDirectoryPath, onNewDirectory }) {
        // Antd docs uses any
        const t = useTranslate();
        const inputRef = useRef<any>();
        const [name, setText] = useState(t("new-directory"));

        const onCancel =
            onNewDirectory && (() => onNewDirectory({ directoryName: "", parentDirectoryPath }));
        const onConfirm =
            onNewDirectory &&
            (() => {
                checkInvalidDirectoryName(name)
                    ? message.error(t("invalid-directory-name-tips"))
                    : onNewDirectory({ directoryName: name, parentDirectoryPath });
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
