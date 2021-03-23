import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { Button } from "antd";
import { CloudStorageStore } from "./store";
import { CloudStorageFileList, CloudStorageUploadPanel } from "../../components/CloudStorage";
import { CloudStorageUploadListContainer } from "./CloudStorageUploadListContainer";

export * from "./store";

export interface CloudStorageContainerProps {
    /** CloudStorage MobX store */
    store: CloudStorageStore;
}

export const CloudStorageContainer = observer<CloudStorageContainerProps>(
    function CloudStorageContainer({ store }) {
        return (
            <div className="cloud-storage-container">
                <div className="cloud-storage-container-controls">
                    {store.compact ? (
                        <div></div>
                    ) : (
                        <div>
                            <h1 className="cloud-storage-container-title">我的云盘</h1>
                            {store.totalUsageHR && (
                                <small className="cloud-storage-container-subtitle">
                                    已使用 {store.totalUsageHR}
                                </small>
                            )}
                        </div>
                    )}
                    <div className="cloud-storage-container-btns">
                        <Button danger onClick={store.onBatchDelete}>
                            删除
                        </Button>
                        <Button type="primary" onClick={store.onUpload}>
                            上传
                        </Button>
                    </div>
                </div>
                <div className="cloud-storage-container-file-list">
                    <CloudStorageFileList
                        files={toJS(store.files)}
                        selectedFileUUIDs={store.selectedFileUUIDs}
                        onSelectionChange={store.onSelectionChange}
                    />
                </div>
                <CloudStorageUploadPanel
                    className="cloud-storage-container-upload-panel"
                    compact={store.compact}
                    hasError={store.hasUploadError}
                    expand={store.isUploadPanelExpand}
                    finished={store.uploadFinishedCount}
                    total={store.uploadTotalCount}
                    onClose={store.onUploadPanelClose}
                    onExpandChange={store.onUploadPanelExpandChange}
                >
                    <CloudStorageUploadListContainer
                        statuses={store.sortedUploadStatus}
                        onCancel={store.onUploadCancel}
                        onRetry={store.onUploadRetry}
                    />
                </CloudStorageUploadPanel>
            </div>
        );
    },
);
