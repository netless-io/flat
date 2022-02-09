import "./style.less";
import arrowSVG from "./icons/panel-arrow.svg";
import closeSVG from "./icons/panel-close.svg";

import React, { FC } from "react";
import { Button } from "antd";
import classNames from "classnames";
import { useResizeDetector } from "react-resize-detector";
import { CloudStorageUploadTitle } from "../CloudStorageUploadTitle";

export interface CloudStorageUploadPanelProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    /** Max Panel Height */
    maxHeight?: number;
    /** Upload finish with error */
    finishWithError?: boolean;
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
    finishWithError,
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
    const { height: contentHeight = 0, width: contentWidth, ref: resizeRef } = useResizeDetector();

    return (
        <section
            {...restProps}
            className={classNames(className, "cloud-storage-upload-panel", {
                "is-panel-compact": compact,
                "is-panel-fold": !expand,
            })}
        >
            <header
                className="cloud-storage-upload-panel-head"
                onClickCapture={(e: React.MouseEvent) => {
                    if (compact && onExpandChange) {
                        onExpandChange(!expand);
                        e.stopPropagation();
                    }
                }}
            >
                <CloudStorageUploadTitle
                    finishWithError={finishWithError}
                    finished={finished}
                    total={total}
                />
                <div className="cloud-storage-upload-panel-head-btns">
                    <Button
                        className="cloud-storage-upload-panel-expand-btn"
                        shape="circle"
                        size="small"
                        onClick={() => onExpandChange && onExpandChange(!expand)}
                    >
                        <img height={22} src={arrowSVG} width={22} />
                    </Button>
                    {!compact && (
                        <Button shape="circle" size="small" onClick={onClose}>
                            <img height={22} src={closeSVG} width={22} />
                        </Button>
                    )}
                </div>
            </header>
            <div
                className="cloud-storage-upload-panel-content fancy-scrollbar"
                style={{
                    width: compact && !expand ? 200 : contentWidth,
                    height: expand ? (contentHeight < maxHeight ? contentHeight : maxHeight) : 0,
                }}
            >
                <div ref={resizeRef} className="cloud-storage-upload-panel-content-sizer">
                    <div className="cloud-storage-upload-panel-status-list">{children}</div>
                </div>
            </div>
        </section>
    );
};
