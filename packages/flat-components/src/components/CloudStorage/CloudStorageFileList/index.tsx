import "./style.less";

import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Table } from "antd";
import prettyBytes from "pretty-bytes";
import { format } from "date-fns";
import { FileOutlined } from "@ant-design/icons";
import { CloudStorageFileListHeadTip } from "../CloudStorageFileListHeadTip";
import { ColumnsType } from "antd/lib/table";

export interface CloudStorageFile {
    name: string;
    size: number;
    createAt: Date;
}

export interface CloudStorageFileListProps {
    /** Cloud Storage List items */
    files: CloudStorageFile[];
}

/**
 * Render a table list of Cloud Storage items.
 */
export const CloudStorageFileList = observer<CloudStorageFileListProps>(
    function CloudStorageFileList(props) {
        const [selectedRowKeys, updateSelectedRowKeys] = useState<React.Key[]>([]);
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
                    dataIndex: "name",
                    ellipsis: true,
                    // eslint-disable-next-line react/display-name
                    render: (name: CloudStorageFile["name"]) => (
                        <span className="cloud-storage-file-list-name" title={name}>
                            <FileOutlined /> {name}
                        </span>
                    ),
                },
                {
                    title: "大小",
                    dataIndex: "size",
                    ellipsis: true,
                    width: "20%",
                    // eslint-disable-next-line react/display-name
                    render: (size: CloudStorageFile["size"]) => {
                        const formattedSize = prettyBytes(size);
                        return <span title={formattedSize}>{formattedSize}</span>;
                    },
                },
                {
                    title: "修改日期",
                    dataIndex: "createAt",
                    ellipsis: true,
                    width: "20%",
                    // eslint-disable-next-line react/display-name
                    render: (date: CloudStorageFile["createAt"]) => {
                        const formattedDate = format(date, "yyyy/MM/dd HH:mm:ss");
                        return <span title={formattedDate}>{formattedDate}</span>;
                    },
                },
            ],
            [],
        );

        return (
            <Table
                className="cloud-storage-file-list-table"
                columns={columns}
                dataSource={props.files}
                pagination={false}
                rowSelection={{
                    selectedRowKeys,
                    onChange: updateSelectedRowKeys,
                }}
            />
        );
    },
);
