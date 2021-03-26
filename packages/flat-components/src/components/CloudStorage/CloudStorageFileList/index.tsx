import "./style.less";

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

export interface CloudStorageFileListProps
    extends Pick<
        CloudStorageFileListFileNameProps,
        "fileMenus" | "onItemMenuClick" | "titleClickable" | "onItemTitleClick"
    > {
    /** Cloud Storage List items */
    files: CloudStorageFile[];
    /** User selected file UUIDs */
    selectedFileUUIDs: string[];
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
}) => {
    const popupContainerRef = useRef<HTMLDivElement>(null);
    const getPopupContainer = useCallback(() => popupContainerRef.current || document.body, []);

    const columns = useMemo<ColumnsType<CloudStorageFile>>(
        () => [
            {
                title: (
                    <>
                        文件名称{" "}
                        <CloudStorageFileListHeadTip
                            title="支持上传 PPT、PPTX、DOC、DOCX、PDF、PNG、JPG、GIF 文件格式"
                            placement="right"
                            getPopupContainer={getPopupContainer}
                        />
                    </>
                ),
                dataIndex: "fileName",
                ellipsis: true,
                render: function renderCloudStorageFileName(_fileName, file, index) {
                    return (
                        <CloudStorageFileListFileName
                            getPopupContainer={getPopupContainer}
                            file={file}
                            index={index}
                            fileMenus={fileMenus}
                            titleClickable={titleClickable}
                            onItemMenuClick={onItemMenuClick}
                            onItemTitleClick={onItemTitleClick}
                        />
                    );
                },
            },
            {
                title: "大小",
                dataIndex: "fileSize",
                ellipsis: true,
                width: "20%",
                render: function renderCloudStorageFileSize(
                    fileSize: CloudStorageFile["fileSize"],
                ) {
                    const formattedSize = prettyBytes(fileSize);
                    return <span title={formattedSize}>{formattedSize}</span>;
                },
            },
            {
                title: "修改日期",
                dataIndex: "createAt",
                ellipsis: true,
                width: "20%",
                render: function renderCloudStorageCreateAt(date: CloudStorageFile["createAt"]) {
                    const formattedDate = format(date, "yyyy/MM/dd HH:mm:ss");
                    return <span title={formattedDate}>{formattedDate}</span>;
                },
            },
        ],
        [fileMenus, getPopupContainer, onItemMenuClick, onItemTitleClick, titleClickable],
    );

    return (
        <div ref={popupContainerRef} className="cloud-storage-file-list-table">
            <Table
                columns={columns}
                dataSource={files}
                rowKey="fileUUID"
                pagination={false}
                rowSelection={{
                    selectedRowKeys: selectedFileUUIDs,
                    onChange: onSelectionChange as (keys: React.Key[]) => void,
                }}
            />
        </div>
    );
};
