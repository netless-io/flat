import "./style.less";

import React, { useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Dropdown, Menu } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { CSSTransition } from "react-transition-group";
import { CloudStorageStore } from "./store";
import { CloudStorageSkeletons, CloudStorageUploadPanel } from "../../components/CloudStorage";
import { CloudStorageUploadListContainer } from "./CloudStorageUploadListContainer";
import { CloudStorageFileListContainer } from "./CloudStorageFileListContainer";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { CloudStorageExternalFilePanel } from "./CloudStorageExternalFilePanel";

export * from "./store";

export interface CloudStorageContainerProps {
    /** CloudStorage MobX store */
    store: CloudStorageStore;
}

/** CloudStorage page with MobX Store */
export const CloudStorageContainer = observer<CloudStorageContainerProps>(
    function CloudStorageContainer({ store }) {
        const { t } = useTranslation();

        const [isH5PanelVisible, setH5PanelVisible] = useState(false);

        const handleMenuClick = useCallback(({ key }: { key: string }) => {
            if (key === "h5") {
                setH5PanelVisible(true);
            }
        }, []);

        const containerBtns = (
            <div className="cloud-storage-container-btns">
                <Button
                    danger
                    onClick={store.onBatchDelete}
                    disabled={store.selectedFileUUIDs.length <= 0}
                >
                    {t("delete")}
                </Button>
                <Dropdown.Button
                    type="primary"
                    onClick={store.onUpload}
                    overlay={
                        <Menu onClick={handleMenuClick}>
                            <Menu.Item key="h5" icon={<FormOutlined />}>
                                {t("online-h5.add")}
                            </Menu.Item>
                        </Menu>
                    }
                >
                    {t("upload")}
                </Dropdown.Button>
            </div>
        );

        return (
            <div className="cloud-storage-container">
                {!store.compact && (
                    <div className="cloud-storage-container-head">
                        <div>
                            <h1 className="cloud-storage-container-title">{t("my-cloud ")}</h1>
                            <small
                                className={classNames("cloud-storage-container-subtitle", {
                                    "is-hide": !store.totalUsage,
                                })}
                            >
                                {store.totalUsageHR
                                    ? t("used-storage", { usage: store.totalUsageHR })
                                    : "-"}
                            </small>
                        </div>
                        {containerBtns}
                    </div>
                )}
                <div className="cloud-storage-container-file-list fancy-scrollbar">
                    {!store.totalUsageHR ? (
                        <CloudStorageSkeletons isCompactMode={store.compact} />
                    ) : (
                        <CloudStorageFileListContainer store={store} />
                    )}
                </div>
                <CSSTransition
                    in={store.isUploadPanelVisible && store.isUploadPanelExpand && store.compact}
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
                <CloudStorageExternalFilePanel
                    store={store}
                    visible={isH5PanelVisible}
                    onClose={() => setH5PanelVisible(false)}
                />
            </div>
        );
    },
);
