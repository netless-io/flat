import "./style.less";

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Progress } from "antd";
import React from "react";

export interface CloudStorageUploadTitleProps {
    finishWithError?: boolean;
    finished: number;
    total: number;
}

export const CloudStorageUploadTitle = React.memo<CloudStorageUploadTitleProps>(
    function CloudStorageUploadTitle({ finishWithError, finished, total }) {
        const percent = finished && total ? (finished / total) * 100 : 0;
        const isFinish = percent >= 100;

        return (
            <div className="cloud-storage-upload-title">
                {finishWithError ? (
                    <ExclamationCircleOutlined className="cloud-storage-upload-title-error" />
                ) : (
                    <Progress
                        type="circle"
                        percent={percent}
                        width={20}
                        strokeWidth={isFinish ? 8 : 10}
                        showInfo={isFinish}
                    />
                )}
                <h1 className="cloud-storage-upload-title-content">
                    {finishWithError ? "上传异常" : isFinish ? "上传完成" : "传输列表"}
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
