import "./style.less";

import { ExclamationCircleOutlined, UpOutlined, CloseOutlined } from "@ant-design/icons";
import React, { FC, useState } from "react";
import { Button } from "antd";
import classNames from "classnames";
import { ResizeReporter } from "react-resize-reporter/scroll";

export interface CloudStorageUploadPanelProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    /** Max Panel Height */
    maxHeight?: number;
    /** If at least one failed upload */
    hasError?: boolean;
    /** Compact version of the panel */
    compact?: boolean;
    /** Should expand panel */
    expand: boolean;
    /** Number of finished upload */
    finished: number;
    /** Number of total upload */
    total: number;
    /** Panel close button clicked */
    onClose: (event?: React.MouseEvent<HTMLElement>) => void;
    /** Panel expand button clicked */
    onExpandChange?: (isExpand: boolean) => void;
}

export const CloudStorageUploadPanel: FC<CloudStorageUploadPanelProps> = ({
    maxHeight = 260,
    hasError,
    compact,
    expand,
    finished,
    total,
    className,
    children,
    onExpandChange,
    onClose,
    ...restProps
}) => {
    const [contentHeight, setContentHeight] = useState(0);

    return (
        <section {...restProps} className={classNames(classNames, "cloud-storage-upload-panel")}>
            <header className="cloud-storage-upload-panel-head">
                {hasError ? (
                    <>
                        <ExclamationCircleOutlined className="cloud-storage-upload-panel-warning" />{" "}
                        <h1 className="cloud-storage-upload-panel-title">上传异常</h1>
                    </>
                ) : (
                    <h1 className="cloud-storage-upload-panel-title">传输列表</h1>
                )}
                <div className="cloud-storage-upload-panel-count">
                    {finished}/{total}
                </div>
                <div className="cloud-storage-upload-panel-head-btns">
                    {!compact && (
                        <Button
                            shape="circle"
                            size="small"
                            onClick={() => onExpandChange && onExpandChange(!expand)}
                        >
                            <UpOutlined rotate={expand ? 180 : 0} />
                        </Button>
                    )}
                    <Button shape="circle" size="small" onClick={onClose}>
                        <CloseOutlined />
                    </Button>
                </div>
            </header>
            <div
                className="cloud-storage-upload-panel-content"
                style={{
                    height:
                        expand || compact
                            ? contentHeight < maxHeight
                                ? contentHeight
                                : maxHeight
                            : 0,
                }}
            >
                <div className="cloud-storage-upload-panel-content-sizer">
                    <ResizeReporter reportInit onHeightChanged={setContentHeight} />
                    <div className="cloud-storage-upload-panel-status-list">{children}</div>
                </div>
            </div>
        </section>
    );
};
