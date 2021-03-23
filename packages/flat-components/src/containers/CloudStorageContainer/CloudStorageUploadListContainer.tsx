import React from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageUploadStatus } from "../../components/CloudStorage/types";
import {
    CloudStorageUploadItemContainer,
    CloudStorageUploadItemContainerProps,
} from "./CloudStorageUploadItemContainer";

export type CloudStorageUploadListContainerProps = {
    statuses: CloudStorageUploadStatus[];
} & Pick<CloudStorageUploadItemContainerProps, "onCancel" | "onRetry">;

export const CloudStorageUploadListContainer = observer<CloudStorageUploadListContainerProps>(
    function CloudStorageUploadListContainer({ statuses, onCancel, onRetry }) {
        return (
            <>
                {statuses.map(status => (
                    <CloudStorageUploadItemContainer
                        key={status.fileUUID}
                        status={status}
                        onCancel={onCancel}
                        onRetry={onRetry}
                    />
                ))}
            </>
        );
    },
);
