import "./style.less";

import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "antd";
import { CSSTransition } from "react-transition-group";
import { CloudStorageStore } from "./store";
import { CloudStorageUploadPanel } from "../../components/CloudStorage";
import { CloudStorageUploadListContainer } from "./CloudStorageUploadListContainer";
import { CloudStorageFileListContainer } from "./CloudStorageFileListContainer";

export * from "./store";

export interface CloudStorageContainerProps {
    /** CloudStorage MobX store */
    store: CloudStorageStore;
}

/** CloudStorage page with MobX Store */
export const CloudStorageContainer = observer<CloudStorageContainerProps>(
    function CloudStorageContainer({ store }) {
        const onUploadPanelClick = useCallback(
            (e: React.MouseEvent) => {
                if (store.compact) {
                    store.setPanelExpand(!store.isUploadPanelExpand);
                    e.stopPropagation();
                }
            },
            [store],
        );

        const containerBtns = (
            <div className="cloud-storage-container-btns">
                <Button
                    danger
                    onClick={store.onBatchDelete}
                    disabled={store.selectedFileUUIDs.length <= 0}
                >
                    删除
                </Button>
                <Button type="primary" onClick={store.onUpload}>
                    上传
                </Button>
            </div>
        );

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
                        {containerBtns}
                    </div>
                )}
                <div className="cloud-storage-container-file-list fancy-scrollbar">
                    <CloudStorageFileListContainer store={store} />
                </div>
                <CSSTransition
                    in={store.isUploadPanelExpand && store.compact}
                    timeout={400}
                    classNames="cloud-storage-container-mask"
                    mountOnEnter
                    unmountOnExit
                >
                    <div
                        className="cloud-storage-container-mask"
                        onClick={e => {
                            if (e.target === e.currentTarget) {
                                store.setPanelExpand(false);
                            }
                        }}
                    />
                </CSSTransition>
                {store.isUploadPanelVisible && (
                    <CloudStorageUploadPanel
                        className="cloud-storage-container-upload-panel"
                        compact={store.compact}
                        finishWithError={store.uploadFinishWithError}
                        expand={store.isUploadPanelExpand}
                        finished={store.uploadFinishedCount}
                        total={store.uploadTotalCount}
                        onClickCapture={onUploadPanelClick}
                        onClose={store.onUploadPanelClose}
                        onExpandChange={store.setPanelExpand}
                    >
                        <CloudStorageUploadListContainer
                            tasks={store.sortedUploadTasks}
                            onCancel={store.onUploadCancel}
                            onRetry={store.onUploadRetry}
                        />
                    </CloudStorageUploadPanel>
                )}
                {store.compact && (
                    <div className="cloud-storage-container-footer">{containerBtns}</div>
                )}
            </div>
        );
    },
);
