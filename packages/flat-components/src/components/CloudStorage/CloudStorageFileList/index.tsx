import "./style.less";
import EmptyFileSVG from "./icons/EmptyFileSVG";

import React, { useCallback, useContext, useMemo, useRef } from "react";
import { Table } from "antd";
import prettyBytes from "pretty-bytes";
import { format } from "date-fns";
import { ColumnsType } from "antd/lib/table";
import { CloudStorageFileListHeadTip } from "../CloudStorageFileListHeadTip";
import {
    CloudStorageFileListFileName,
    CloudStorageFileListFileNameProps,
} from "./CloudStorageFileListFileName";
import { useTranslate } from "@netless/flat-i18n";
import { SVGListLoading } from "../../FlatIcons";
import { CloudFile } from "@netless/flat-server-api";
import { createFileNameComparer } from "./utils";
import { DarkModeContext } from "../../FlatThemeProvider";

export interface CloudStorageFileListProps
    extends Pick<
        CloudStorageFileListFileNameProps,
        | "fileMenus"
        | "onItemMenuClick"
        | "titleClickable"
        | "onItemTitleClick"
        | "renamingFileUUID"
        | "onRename"
        | "onNewDirectoryFile"
        | "parentDirectoryPath"
    > {
    /** Cloud Storage List items */
    files: CloudFile[];
    /** User selected file UUIDs */
    selectedFileUUIDs: string[];
    isLoadingData: Boolean;
    /** Fires when user select or deselect files */
    onSelectionChange: (fileUUID: string[]) => void;
}

/**
 * Render a table list of Cloud Storage items.
 */
export const CloudStorageFileList: React.FC<CloudStorageFileListProps> = ({
    files,
    selectedFileUUIDs,
    onSelectionChange,
    fileMenus,
    onItemMenuClick,
    titleClickable = false,
    onItemTitleClick,
    renamingFileUUID,
    isLoadingData,
    onRename,
    onNewDirectoryFile,
    parentDirectoryPath,
}) => {
    const t = useTranslate();
    const darkMode = useContext(DarkModeContext);
    const popupContainerRef = useRef<HTMLDivElement>(null);
    const getPopupContainer = useCallback(() => popupContainerRef.current || document.body, []);

    const columns = useMemo<ColumnsType<CloudFile>>(
        () => [
            {
                title: (
                    <span className="cloud-storage-file-list-title-span">
                        <span className="cloud-storage-file-list-title">{t("file-name")}</span>
                        <CloudStorageFileListHeadTip
                            getPopupContainer={getPopupContainer}
                            placement="right"
                            title={t("supported-file-types")}
                        />
                    </span>
                ),
                dataIndex: "fileName",
                ellipsis: true,
                sorter: createFileNameComparer(),
                showSorterTooltip: false,
                render: function renderCloudStorageFileName(_fileName, file, index) {
                    return (
                        <CloudStorageFileListFileName
                            file={file}
                            fileMenus={fileMenus}
                            getPopupContainer={getPopupContainer}
                            index={index}
                            parentDirectoryPath={parentDirectoryPath}
                            renamingFileUUID={renamingFileUUID}
                            titleClickable={titleClickable}
                            onItemMenuClick={onItemMenuClick}
                            onItemTitleClick={onItemTitleClick}
                            onNewDirectoryFile={onNewDirectoryFile}
                            onRename={onRename}
                        />
                    );
                },
            },
            {
                title: <span className="cloud-storage-file-list-title">{t("file-size")}</span>,
                dataIndex: "fileSize",
                ellipsis: true,
                width: 100,
                sorter: (file1, file2) => file1.fileSize - file2.fileSize,
                showSorterTooltip: false,
                render: function renderCloudStorageFileSize(fileSize: CloudFile["fileSize"]) {
                    const formattedSize = prettyBytes(fileSize);
                    return (
                        <span title={formattedSize}>{fileSize === 0 ? "-" : formattedSize}</span>
                    );
                },
            },
            {
                title: <span className="cloud-storage-file-list-title">{t("edit-date")}</span>,
                dataIndex: "createAt",
                ellipsis: true,
                width: 170,
                sorter: (file1, file2) => file1.createAt.valueOf() - file2.createAt.valueOf(),
                sortDirections: ["ascend", "descend", "ascend"],
                showSorterTooltip: false,
                render: function renderCloudStorageCreateAt(date: CloudFile["createAt"]) {
                    const formattedDate = format(date, "yyyy/MM/dd HH:mm");
                    return <span title={formattedDate}>{formattedDate}</span>;
                },
            },
        ],
        [
            t,
            getPopupContainer,
            fileMenus,
            parentDirectoryPath,
            renamingFileUUID,
            titleClickable,
            onItemMenuClick,
            onItemTitleClick,
            onNewDirectoryFile,
            onRename,
        ],
    );

    return (
        <div ref={popupContainerRef} className="cloud-storage-file-list-table">
            <Table
                columns={columns}
                dataSource={files || []}
                locale={{
                    emptyText: " ",
                }}
                pagination={false}
                rowKey="fileUUID"
                rowSelection={{
                    selectedRowKeys: selectedFileUUIDs,
                    onChange: onSelectionChange as (keys: React.Key[]) => void,
                }}
                size="small"
            />
            {isLoadingData && (
                <div className="cloud-storage-pull-up-loading">
                    <SVGListLoading />
                </div>
            )}
            {files.length <= 0 && (
                <div className="cloud-storage-file-list-empty">
                    <div className="cloud-storage-file-list-empty-content">
                        <EmptyFileSVG isDark={darkMode} />
                        <div className="cloud-storage-file-list-empty-text">{t("no-data")}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
