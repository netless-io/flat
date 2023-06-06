import "./style.less";
import deleteSVG from "./icons/delete.svg";
import newDirectorySVG from "./icons/new-directory.svg";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Dropdown, Menu } from "antd";
import { CSSTransition } from "react-transition-group";
import { CloudStorageStore } from "./store";
import { CloudStorageSkeletons, CloudStorageUploadPanel } from "../../components/CloudStorage";
import { CloudStorageUploadListContainer } from "./CloudStorageUploadListContainer";
import { CloudStorageFileListContainer } from "./CloudStorageFileListContainer";
import classNames from "classnames";
import { useTranslate } from "@netless/flat-i18n";
import { CloudStorageNavigation } from "../../components/CloudStorage/CloudStorageNavigation";

export * from "./store";

export interface CloudStorageContainerProps {
    /** CloudStorage MobX store */
    store: CloudStorageStore;
    path: string | null;
    pushHistory: (path: string) => void;
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
];

const isSupportedFile = (file: File): boolean => {
    return SupportedFileExts.some(ext => file.name.endsWith(ext));
};

const areAllSupportedFiles = (files: FileList): boolean => {
    return Array.from(files).every(file => isSupportedFile(file));
};

/** CloudStorage page with MobX Store */
export const CloudStorageContainer = /* @__PURE__ */ observer<CloudStorageContainerProps>(
    function CloudStorageContainer({ store, path, pushHistory }) {
        const t = useTranslate();
        const cloudStorageContainerRef = useRef<HTMLDivElement>(null);
        const [skeletonsVisible, setSkeletonsVisible] = useState(false);
        const [tipsVisible, setTipsVisible] = useState(false);
        const [isAtTheBottom, setIsAtTheBottom] = useState(false);

        // Wait 200ms before showing skeletons to reduce flashing.
        useEffect(() => {
            const ticket = window.setTimeout(() => setSkeletonsVisible(true), 200);
            return () => window.clearTimeout(ticket);
        }, []);

        useEffect(() => {
            if (isAtTheBottom) {
                void store.fetchMoreCloudStorageData(
                    store.cloudStorageDataPagination + 1,
                    store.parentDirectoryPath,
                );
            }
        }, [isAtTheBottom, store]);

        const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>): void => {
            event.preventDefault();
            if (areAllSupportedFiles(event.dataTransfer.files)) {
                event.dataTransfer.dropEffect = "copy";
                setTipsVisible(true);
            }
        }, []);

        const onDragLeave = useCallback((): void => {
            setTipsVisible(false);
        }, []);

        const onDrop = useCallback(
            (event: React.DragEvent<HTMLDivElement>): void => {
                event.preventDefault();
                if (areAllSupportedFiles(event.dataTransfer.files)) {
                    store.onDropFile(event.dataTransfer.files);
                }
                setTipsVisible(false);
            },
            [store],
        );

        const newBtnMenu = (
            <Menu
                items={[
                    {
                        label: t("new-directory"),
                        key: "new-directory",
                        icon: <img src={newDirectorySVG} />,
                        onClick: store.onNewEmptyDirectory,
                    },
                ]}
            />
        );

        const uploadBtnMenu = (
            <Menu
                items={[
                    {
                        label: t("local-file"),
                        key: "local-file",
                        onClick: store.onUpload,
                    },
                ]}
            />
        );

        const renderArrow = (primary?: boolean): React.ReactElement => {
            return (
                <span
                    className={classNames("cloud-storage-container-btn-arrow", {
                        "cloud-storage-container-btn-arrow-primary": primary,
                    })}
                >
                    <span></span>
                    <span></span>
                </span>
            );
        };

        const containerBtns = (
            <div className="cloud-storage-container-btns">
                {store.selectedFileUUIDs.length >= 1 && (
                    <span onClick={store.onBatchDelete}>
                        <img className="cloud-storage-container-btn-delete" src={deleteSVG} />
                    </span>
                )}
                <Dropdown overlay={newBtnMenu} placement="bottomLeft">
                    <Button className="cloud-storage-container-dropdown-btn">
                        {t("new")}
                        {renderArrow()}
                    </Button>
                </Dropdown>
                <Dropdown overlay={uploadBtnMenu} placement="bottomLeft">
                    <Button className="cloud-storage-container-dropdown-btn" type="primary">
                        {t("upload")}
                        {renderArrow(true)}
                    </Button>
                </Dropdown>
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
            <div
                className="cloud-storage-container"
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                {!store.compact && (
                    <div className="cloud-storage-container-head">
                        <div>
                            <h1 className="cloud-storage-container-title">{t("my-cloud")}</h1>
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
                <div className="cloud-storage-container-navigation-box">
                    {path !== null && path !== "/" && (
                        <CloudStorageNavigation path={path} pushHistory={pushHistory} />
                    )}
                </div>
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
                {tipsVisible && (
                    <div className="cloud-storage-container-tips">
                        <div className="cloud-storage-container-tips-content">
                            {t("drop-to-storage")}
                        </div>
                    </div>
                )}
            </div>
        );
    },
);
