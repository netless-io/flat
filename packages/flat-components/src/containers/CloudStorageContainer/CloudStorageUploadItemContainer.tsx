import React from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageUploadItem, CloudStorageUploadItemProps } from "../../components/CloudStorage";
import { CloudStorageUploadTask } from "../../components/CloudStorage/types";

export type CloudStorageUploadItemContainerProps = {
    task: CloudStorageUploadTask;
} & Pick<CloudStorageUploadItemProps, "onCancel" | "onRetry">;

/** Reduce re-rendering */
export const CloudStorageUploadItemContainer =
    /* @__PURE__ */ observer<CloudStorageUploadItemContainerProps>(
        function CloudStorageUploadItemContainer({ task, onCancel, onRetry }) {
            return (
                <CloudStorageUploadItem
                    fileName={task.fileName}
                    percent={task.percent}
                    status={task.status}
                    uploadID={task.uploadID}
                    onCancel={onCancel}
                    onRetry={onRetry}
                />
            );
        },
    );
