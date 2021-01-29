import React from "react";
import { Table } from "antd";
import "./HotKeySetting.less";

interface HotKeyTable {
    name: string;
    key: string;
    desc: string;
}

interface HotKey {
    name: string;
    hotKey: string;
    key?: string;
}

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

const HotKeyTableRow = Object.freeze(["工具栏", "编辑"]);

const HotKeyTableExpandTitleList = [
    {
        dataIndex: "name"
    },
    {
        dataIndex: "hotKey"
    }
];

const HotKeyTableExpandRow : {
    [index: string]: HotKey[]
} = {
    "tools": [
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
    "edit": [
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

export const HotKeySetting = (): React.ReactElement => {

    const HotKeyTableKeys = Object.freeze(Object.keys(HotKeyTableExpandRow));

    // If you need to add content above the function, please don"t forget to add a semicolon
    (function setExpandRowKey(): void {
        HotKeyTableKeys.forEach((data: string) => {
            HotKeyTableExpandRow[data].forEach((row: HotKey, index) => {
                row.key = `${row.name + index}`;
            });
        });
    })();

    const tableRow = (): HotKeyTable[] => {
        return HotKeyTableKeys.map((data: string, index) => {
            return {
                name: data,
                key: `${data + index}`,
                desc: HotKeyTableRow[index]
            };
        });
    };

    const expandedRowRender = (row: HotKeyTable): React.ReactElement => {
        return <Table columns={HotKeyTableExpandTitleList} dataSource={HotKeyTableExpandRow[row.name]} pagination={false} />;
    };

    return (
        <div className="content-container">
            <div className="header-container">
                <span>热键设置</span>
            </div>
            <div className="content-inner">
                <Table columns={HotKeyTableTitleList} dataSource={tableRow()} expandable={{expandedRowRender}} pagination={false} scroll={{y: 500}} />
            </div>
        </div>
    );
};
