import "./style.less";
import checkSVG from "../../../assets/check.svg";
import trashBinSVG from "../../../assets/trash-bin.svg";
import retrySVG from "../../../assets/retry.svg";

import React from "react";
import { Button } from "antd";
import classNames from "classnames";
import { CloudStorageFileTitle } from "../CloudStorageFileTitle";
import { CloudStorageUploadStatus } from "../types";

export interface CloudStorageUploadItemProps extends CloudStorageUploadStatus {
    /** Restart uploading this file */
    onRetry: (fileUUID: string) => void;
    /** Stop uploading this file */
    onCancel: (fileUUID: string) => void;
}

/**
 *
 * Cloud Storage upload list item.
 */
export const CloudStorageUploadItem: React.FC<CloudStorageUploadItemProps> = ({
    fileUUID,
    fileName,
    percent,
    hasError,
    onRetry,
    onCancel,
}) => {
    const isSuccess = !hasError && percent >= 100;

    return (
        <div className="cloud-storage-upload-item">
            <CloudStorageFileTitle
                iconClassName="cloud-storage-upload-file-icon"
                fileName={fileName}
            />
            {hasError ? (
                <>
                    <span className="cloud-storage-upload-status is-error">上传失败</span>
                    <Button
                        className="cloud-storage-upload-status-btn"
                        shape="circle"
                        size="small"
                        onClick={() => onRetry(fileUUID)}
                    >
                        <img width={22} height={22} src={retrySVG} aria-hidden />
                    </Button>
                </>
            ) : isSuccess ? (
                <>
                    <span className="cloud-storage-upload-status is-success">上传成功</span>
                    <div className="cloud-storage-upload-status-btn">
                        <img width={22} height={22} src={checkSVG} aria-hidden />
                    </div>
                </>
            ) : (
                <>
                    <span className="cloud-storage-upload-status">
                        {percent <= 0 ? "待上传" : `${percent}%`}
                    </span>
                    <Button
                        className="cloud-storage-upload-status-btn"
                        shape="circle"
                        size="small"
                        onClick={() => onCancel(fileUUID)}
                    >
                        <img width={22} height={22} src={trashBinSVG} aria-hidden />
                    </Button>
                </>
            )}

            <div
                className={classNames("cloud-storage-upload-item-progress-bar", {
                    "is-error": hasError,
                })}
                style={{ width: `${percent}%` }}
            />
        </div>
    );
};

export default CloudStorageUploadItem;
