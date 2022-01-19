import React from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Progress } from "antd";
import { useTranslation } from "react-i18next";
import "./style.less";

export interface CloudStorageUploadTitleProps {
    finishWithError?: boolean;
    finished: number;
    total: number;
}

export const CloudStorageUploadTitle = React.memo<CloudStorageUploadTitleProps>(
    function CloudStorageUploadTitle({ finishWithError, finished, total }) {
        const { t } = useTranslation();
        const percent = finished && total ? (finished / total) * 100 : 0;
        const isFinish = percent >= 100;

        return (
            <div className="cloud-storage-upload-title">
                {finishWithError ? (
                    <ExclamationCircleOutlined className="cloud-storage-upload-title-error" />
                ) : (
                    <Progress
                        percent={percent}
                        showInfo={isFinish}
                        strokeWidth={isFinish ? 8 : 10}
                        type="circle"
                        width={20}
                    />
                )}
                <h1 className="cloud-storage-upload-title-content">
                    {finishWithError
                        ? t("upload-exception")
                        : isFinish
                        ? t("upload-completed")
                        : t("transfer-list")}
                </h1>
                {!isFinish && !finishWithError && total && !Number.isNaN(finished) && (
                    <span className="cloud-storage-upload-title-count">
                        {finished}/{total}
                    </span>
                )}
            </div>
        );
    },
);
