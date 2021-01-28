import React from "react";
import { Table } from "antd";
import "./HotKeySetting.less";

export const HotKeySetting = (): React.ReactElement => {

    const HotKeyTableKeys = ["tools", "edit"];

    // the table column of parent
    const HotKeyTableTitleList = [
        {
            title: "名称",
            dataIndex: "desc"
        },
        {
            title: "快捷键",
            dataIndex: ""
        }
    ];

    // the table row of parent
    const HotKeyTableRow = ["工具栏", "编辑"];

    // the table column of child
    const HotKeyTableExpandTitleList = [
        {
            dataIndex: "name"
        },
        {
            dataIndex: "hotKey"
        }
    ];

    // the table row of child
    const HotKeyTableExpandRow = {
        [HotKeyTableKeys[0]]: [
            {
                name: "选择",
                hotKey: "S"
            }, {
                name: "画笔",
                hotKey: "P"
            }, {
                name: "文字",
                hotKey: "T"
            }, {
                name: "橡皮擦",
                hotKey: "E"
            }, {
                name: "圆形",
                hotKey: "C"
            }, {
                name: "矩形",
                hotKey: "R"
            }, {
                name: "箭头",
                hotKey: "A"
            }, {
                name: "激光笔",
                hotKey: "L"
            }, {
                name: "抓手",
                hotKey: "H"
            }],
        [HotKeyTableKeys[1]]: [
            {
                name: "删除所选对象",
                hotKey: "Backspace / Delete"
            }, {
                name: "等比例缩放",
                hotKey: "Shift / ⇧"
            }, {
                name: "撤销",
                hotKey: "Ctrl + Z / ⌘ + Z"
            }, {
                name: "重做",
                hotKey: "Ctrl + Y / ⌘ + Y"
            }, {
                name: "复制",
                hotKey: "Ctrl + C / ⌘ + C"
            }, {
                name: "粘贴",
                hotKey: "Ctrl + V / ⌘ + V"
            }]
    };

    const tableRow = (): any => {
        const tableData: any = [];
        HotKeyTableKeys.forEach((data: any, index: any) => {
            const item: any = {};
            item.name = data;
            item.key = index;
            item.desc = HotKeyTableRow[index];
            tableData.push(item);
        });
        return tableData;
    };

    const tableTitleList = (): any => {
        return HotKeyTableTitleList;
    };

    const expandRow = (type: string): any[] => {
        const expandRowMap: any = HotKeyTableExpandRow;

        HotKeyTableKeys.forEach((data: any) => {
            expandRowMap[data].forEach((row: any, index: any) => {
                row.key = `${row.name + index}`;
            });
        });

        return expandRowMap[type];
    };

    const tableExpandTitleList = (): any => {
        return HotKeyTableExpandTitleList;
    };


    const expandedRowRender = (row: any): any => {
        return <Table columns={tableExpandTitleList()} dataSource={expandRow(row.name)} pagination={false} />;
    };

    return (
        <div className="content-container">
            <div className="header-container">
                <span>热键设置</span>
            </div>
            <div className="content-inner">
                <Table columns={tableTitleList()} dataSource={tableRow()} expandable={{ expandedRowRender }} pagination={false} scroll={{ y: 500 }} />
            </div>
        </div>
    );
};
