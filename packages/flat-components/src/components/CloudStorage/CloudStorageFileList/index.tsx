import "./style.less";

import React, { useMemo, useRef } from "react";
import { Table } from "antd";
import prettyBytes from "pretty-bytes";
import { format } from "date-fns";
import { ColumnsType } from "antd/lib/table";
import { CloudStorageFile } from "../types";
import { CloudStorageFileListHeadTip } from "../CloudStorageFileListHeadTip";
import { CloudStorageFileListFileName } from "./CloudStorageFileListFileName";

export interface CloudStorageFileListProps {
    /** Cloud Storage List items */
    files: CloudStorageFile[];
    /** User selected file UUIDs */
    selectedFileUUIDs: string[];
    /** Fires when user select or deselect files */
    onSelectionChange: (fileUUID: string[]) => void;
    /** Render file menus item base on fileUUID */
    fileMenus?: (
        file: CloudStorageFile,
        index: number,
    ) => Array<{ key: React.Key; name: React.ReactNode }> | void | undefined | null;
    /** When a file menus item is clicked */
    onItemMenuClick?: (fileUUID: string, menuKey: React.Key) => void;
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
}) => {
    const popupContainerRef = useRef<HTMLDivElement>(null);

    const columns = useMemo<ColumnsType<CloudStorageFile>>(
        () => [
            {
                title: (
                    <>
                        文件名称{" "}
                        <CloudStorageFileListHeadTip
                            title="支持上传 PPT、PPTX、DOC、DOCX、PDF、PNG、JPG、GIF 文件格式"
                            placement="right"
                        />
                    </>
                ),
                dataIndex: "fileName",
                ellipsis: true,
                render: function renderCloudStorageFileName(_fileName, file, index) {
                    return (
                        <CloudStorageFileListFileName
                            popupContainerRef={popupContainerRef}
                            file={file}
                            index={index}
                            fileMenus={fileMenus}
                            onItemMenuClick={onItemMenuClick}
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
        [fileMenus, onItemMenuClick],
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
