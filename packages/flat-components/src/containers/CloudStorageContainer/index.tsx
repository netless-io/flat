import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { Button } from "antd";
import { CSSTransition } from "react-transition-group";
import { CloudStorageStore } from "./store";
import { CloudStorageFileList, CloudStorageUploadPanel } from "../../components/CloudStorage";
import { CloudStorageUploadListContainer } from "./CloudStorageUploadListContainer";

export * from "./store";

export interface CloudStorageContainerProps {
    /** CloudStorage MobX store */
    store: CloudStorageStore;
}

/** CloudStorage page with MobX Store */
export const CloudStorageContainer = observer<CloudStorageContainerProps>(
    function CloudStorageContainer({ store }) {
        return (
            <div className="cloud-storage-container">
                {!store.compact && (
                    <div className="cloud-storage-container-head">
                        <div>
                            <h1 className="cloud-storage-container-title">我的云盘</h1>
                            <small className="cloud-storage-container-subtitle">
                                {store.totalUsageHR ? `已使用 ${store.totalUsageHR}` : " "}
                            </small>
                        </div>
                        <div className="cloud-storage-container-btns">
                            <Button danger onClick={store.onBatchDelete}>
                                删除
                            </Button>
                            <Button type="primary" onClick={store.onUpload}>
                                上传
                            </Button>
                        </div>
                    </div>
                )}
                <div className="cloud-storage-container-file-list">
                    <CloudStorageFileList
                        files={toJS(store.files)}
                        selectedFileUUIDs={store.selectedFileUUIDs}
                        onSelectionChange={store.onSelectionChange}
                    />
                </div>
                <CSSTransition
                    in={store.isUploadPanelExpand && store.compact}
                    timeout={400}
                    classNames="cloud-storage-container-mask"
                    mountOnEnter
                    unmountOnExit
                >
                    <div className="cloud-storage-container-mask" />
                </CSSTransition>
                {store.isUploadPanelVisible && (
                    <CloudStorageUploadPanel
                        className="cloud-storage-container-upload-panel"
                        compact={store.compact}
                        finishWithError={store.uploadFinishWithError}
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
                )}
                {store.compact && (
                    <div className="cloud-storage-container-footer">
                        <div className="cloud-storage-container-btns">
                            <Button danger onClick={store.onBatchDelete}>
                                删除
                            </Button>
                            <Button type="primary" onClick={store.onUpload}>
                                上传
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    },
);
