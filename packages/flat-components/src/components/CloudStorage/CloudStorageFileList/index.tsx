import "./style.less";
import emptyFileSVG from "./icons/empty-file.svg";

import React, { useCallback, useMemo, useRef } from "react";
import { Table } from "antd";
import prettyBytes from "pretty-bytes";
import { format } from "date-fns";
import { ColumnsType } from "antd/lib/table";
import { CloudStorageFile } from "../types";
import { CloudStorageFileListHeadTip } from "../CloudStorageFileListHeadTip";
import {
    CloudStorageFileListFileName,
    CloudStorageFileListFileNameProps,
} from "./CloudStorageFileListFileName";
import { useTranslation } from "react-i18next";
import { SVGListLoading } from "../../FlatIcons";

export interface CloudStorageFileListProps
    extends Pick<
        CloudStorageFileListFileNameProps,
        | "fileMenus"
        | "onItemMenuClick"
        | "titleClickable"
        | "onItemTitleClick"
        | "renamingFileUUID"
        | "onRename"
    > {
    /** Cloud Storage List items */
    files: CloudStorageFile[];
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
}) => {
    const { t } = useTranslation();
    const popupContainerRef = useRef<HTMLDivElement>(null);
    const getPopupContainer = useCallback(() => popupContainerRef.current || document.body, []);

    const columns = useMemo<ColumnsType<CloudStorageFile>>(
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
                render: function renderCloudStorageFileName(_fileName, file, index) {
                    return (
                        <CloudStorageFileListFileName
                            file={file}
                            fileMenus={fileMenus}
                            getPopupContainer={getPopupContainer}
                            index={index}
                            renamingFileUUID={renamingFileUUID}
                            titleClickable={titleClickable}
                            onItemMenuClick={onItemMenuClick}
                            onItemTitleClick={onItemTitleClick}
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
                render: function renderCloudStorageFileSize(
                    fileSize: CloudStorageFile["fileSize"],
                ) {
                    const formattedSize = prettyBytes(fileSize);
                    return <span title={formattedSize}>{formattedSize}</span>;
                },
            },
            {
                title: <span className="cloud-storage-file-list-title">{t("edit-date")}</span>,
                dataIndex: "createAt",
                ellipsis: true,
                width: 170,
                sorter: (file1, file2) => file1.createAt.valueOf() - file2.createAt.valueOf(),
                sortDirections: ["ascend", "descend", "ascend"],
                defaultSortOrder: "descend",
                showSorterTooltip: false,
                render: function renderCloudStorageCreateAt(date: CloudStorageFile["createAt"]) {
                    const formattedDate = format(date, "yyyy/MM/dd HH:mm");
                    return <span title={formattedDate}>{formattedDate}</span>;
                },
            },
        ],
        [
            fileMenus,
            getPopupContainer,
            onItemMenuClick,
            onItemTitleClick,
            onRename,
            renamingFileUUID,
            titleClickable,
            t,
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
                        <img height={124} src={emptyFileSVG} width={124} />
                        <div className="cloud-storage-file-list-empty-text">{t("no-data")}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
