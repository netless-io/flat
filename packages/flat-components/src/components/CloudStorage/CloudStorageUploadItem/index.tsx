import "./style.less";
import checkSVG from "./icons/check.svg";
import trashBinSVG from "./icons/trash-bin.svg";
import retrySVG from "./icons/retry.svg";

import React from "react";
import { Button } from "antd";
import classNames from "classnames";
import { CloudStorageFileTitle } from "../CloudStorageFileTitle";
import { CloudStorageUploadTask } from "../types";
import { useTranslation } from "react-i18next";

export interface CloudStorageUploadItemProps
    extends Pick<CloudStorageUploadTask, "uploadID" | "fileName" | "percent" | "status"> {
    /** Restart uploading this file */
    onRetry: (uploadID: string) => void;
    /** Stop uploading this file */
    onCancel: (uploadID: string) => void;
}

/**
 *
 * Cloud Storage upload list item.
 */
export const CloudStorageUploadItem: React.FC<CloudStorageUploadItemProps> = ({
    uploadID,
    fileName,
    percent,
    status,
    onRetry,
    onCancel,
}) => {
    const { t } = useTranslation();
    return (
        <div className="cloud-storage-upload-item">
            <CloudStorageFileTitle fileUUID={uploadID} fileName={fileName} />
            {renderUploadBody()}
            <div
                className={classNames("cloud-storage-upload-item-progress-bar", {
                    "is-error": status === "error",
                })}
                style={{ width: `${percent}%` }}
            />
        </div>
    );

    function renderUploadBody(): React.ReactElement {
        switch (status) {
            case "uploading": {
                return (
                    <>
                        <span className="cloud-storage-upload-status">{`${percent}%`}</span>
                        <Button
                            className="cloud-storage-upload-status-btn"
                            shape="circle"
                            size="small"
                            onClick={() => onCancel(uploadID)}
                        >
                            <img width={22} height={22} src={trashBinSVG} aria-hidden />
                        </Button>
                    </>
                );
            }
            case "error": {
                return (
                    <>
                        <span className="cloud-storage-upload-status is-error">
                            {t("upload-fail")}
                        </span>
                        <Button
                            className="cloud-storage-upload-status-btn"
                            shape="circle"
                            size="small"
                            onClick={() => onRetry(uploadID)}
                        >
                            <img width={22} height={22} src={retrySVG} aria-hidden />
                        </Button>
                    </>
                );
            }
            case "success": {
                return (
                    <>
                        <span className="cloud-storage-upload-status is-success">
                            {t("upload-success")}
                        </span>
                        <div className="cloud-storage-upload-status-btn">
                            <img width={22} height={22} src={checkSVG} aria-hidden />
                        </div>
                    </>
                );
            }
            default: {
                return (
                    <>
                        <span className="cloud-storage-upload-status">{t("pending-upload")}</span>
                        <Button
                            className="cloud-storage-upload-status-btn"
                            shape="circle"
                            size="small"
                            onClick={() => onCancel(uploadID)}
                        >
                            <img width={22} height={22} src={trashBinSVG} aria-hidden />
                        </Button>
                    </>
                );
            }
        }
    }
};

export default CloudStorageUploadItem;
