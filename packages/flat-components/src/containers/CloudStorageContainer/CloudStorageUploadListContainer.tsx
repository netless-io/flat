import React from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageUploadTask } from "../../components/CloudStorage/types";
import {
    CloudStorageUploadItemContainer,
    CloudStorageUploadItemContainerProps,
} from "./CloudStorageUploadItemContainer";

export type CloudStorageUploadListContainerProps = {
    tasks: CloudStorageUploadTask[];
} & Pick<CloudStorageUploadItemContainerProps, "onCancel" | "onRetry">;

export const CloudStorageUploadListContainer =
    /* @__PURE__ */ observer<CloudStorageUploadListContainerProps>(
        function CloudStorageUploadListContainer({ tasks, onCancel, onRetry }) {
            return (
                <>
                    {tasks.map(task => (
                        <CloudStorageUploadItemContainer
                            key={task.uploadID}
                            task={task}
                            onCancel={onCancel}
                            onRetry={onRetry}
                        />
                    ))}
                </>
            );
        },
    );
