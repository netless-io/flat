import "./style.less";

import React, { useCallback, useEffect, useRef, useState } from "react";
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

const SupportedFileExts = [
    ".ppt",
    ".pptx",
    ".doc",
    ".docx",
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".mp3",
    ".mp4",
    ".ice",
    ".vf",
];

const isSupportedFile = (file: File): boolean => {
    return SupportedFileExts.some(ext => file.name.endsWith(ext));
};

const areAllSupportedFiles = (files: FileList): boolean => {
    return Array.from(files).every(file => isSupportedFile(file));
};

const onDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (areAllSupportedFiles(event.dataTransfer.files)) {
        event.dataTransfer.dropEffect = "copy";
    }
};

/** CloudStorage page with MobX Store */
export const CloudStorageContainer = observer<CloudStorageContainerProps>(
    function CloudStorageContainer({ store }) {
        const { t } = useTranslation();
        const cloudStorageContainerRef = useRef<HTMLDivElement>(null);
        const [skeletonsVisible, setSkeletonsVisible] = useState(false);
        const [isH5PanelVisible, setH5PanelVisible] = useState(false);
        const [isAtTheBottom, setIsAtTheBottom] = useState(false);

        // Wait 200ms before showing skeletons to reduce flashing.
        useEffect(() => {
            const ticket = window.setTimeout(() => setSkeletonsVisible(true), 200);
            return () => window.clearTimeout(ticket);
        }, []);

        useEffect(() => {
            if (isAtTheBottom) {
                void store.fetchMoreCloudStorageData(store.cloudStorageDataPagination + 1);
            }
        }, [isAtTheBottom, store]);

        const handleMenuClick = useCallback(({ key }: { key: string }) => {
            if (key === "h5") {
                setH5PanelVisible(true);
            }
        }, []);

        const onDrop = useCallback(
            (event: React.DragEvent<HTMLDivElement>): void => {
                event.preventDefault();
                if (areAllSupportedFiles(event.dataTransfer.files)) {
                    store.onDropFile(event.dataTransfer.files);
                }
            },
            [store],
        );

        const containerBtns = (
            <div className="cloud-storage-container-btns">
                <Button
                    danger
                    disabled={store.selectedFileUUIDs.length <= 0}
                    onClick={store.onBatchDelete}
                >
                    {t("delete")}
                </Button>
                <Dropdown.Button
                    overlay={
                        <Menu onClick={handleMenuClick}>
                            <Menu.Item key="h5" icon={<FormOutlined />}>
                                {t("online-h5.add")}
                            </Menu.Item>
                        </Menu>
                    }
                    type="primary"
                    onClick={store.onUpload}
                >
                    {t("upload")}
                </Dropdown.Button>
            </div>
        );

        const onCloudStorageListScroll = (): void => {
            if (cloudStorageContainerRef.current) {
                const scrollViewOffsetY = cloudStorageContainerRef.current.scrollTop;
                const scrollViewFrameHeight = cloudStorageContainerRef.current.clientHeight;
                const scrollViewContentHeight = cloudStorageContainerRef.current.scrollHeight;
                // Computer environment of each user using the Flat is different that
                // there maybe can't scroll to the bottom and therefore the isAtTheBottom always false then can't fetch more data.
                // As a result, there setting a threshold value to avoid above scenes.
                const threshold = scrollViewContentHeight - 30;
                setIsAtTheBottom(Math.ceil(scrollViewOffsetY + scrollViewFrameHeight) >= threshold);
            }
        };

        return (
            <div className="cloud-storage-container" onDragOver={onDragOver} onDrop={onDrop}>
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
                <div
                    ref={cloudStorageContainerRef}
                    className="cloud-storage-container-file-list fancy-scrollbar"
                    onScroll={onCloudStorageListScroll}
                >
                    {store.totalUsageHR ? (
                        <CloudStorageFileListContainer
                            isLoadingData={store.isFetchingFiles}
                            store={store}
                        />
                    ) : skeletonsVisible ? (
                        <CloudStorageSkeletons isCompactMode={store.compact} />
                    ) : null}
                </div>
                <CSSTransition
                    mountOnEnter
                    unmountOnExit
                    classNames="cloud-storage-container-mask"
                    in={store.isUploadPanelVisible && store.isUploadPanelExpand && store.compact}
                    timeout={400}
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
                        expand={store.isUploadPanelExpand}
                        finishWithError={store.uploadFinishWithError}
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
