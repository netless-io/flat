import React from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { CloudStorageUploadItem, CloudStorageUploadItemProps } from "../../components/CloudStorage";
import { CloudStorageUploadStatus } from "../../components/CloudStorage/types";

export type CloudStorageUploadItemContainerProps = {
    status: CloudStorageUploadStatus;
} & Pick<CloudStorageUploadItemProps, "onCancel" | "onRetry">;

/** Reduce re-rendering */
export const CloudStorageUploadItemContainer = observer<CloudStorageUploadItemContainerProps>(
    function CloudStorageUploadItemContainer({ status, onCancel, onRetry }) {
        return <CloudStorageUploadItem {...toJS(status)} onCancel={onCancel} onRetry={onRetry} />;
    },
);
