import "./index.less";

import { Table } from "antd";
import React from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";

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
        dataIndex: "desc",
    },
    {
        title: "快捷键",
        dataIndex: "",
    },
];

const HotKeyTableRow = Object.freeze(["工具栏", "编辑"]);

const HotKeyTableExpandTitleList = [
    {
        dataIndex: "name",
    },
    {
        dataIndex: "hotKey",
    },
];

const HotKeyTableExpandRow: {
    [index: string]: HotKey[];
} = {
    tools: [
        {
            name: "选择",
            hotKey: "S",
        },
        {
            name: "画笔",
            hotKey: "P",
        },
        {
            name: "橡皮擦",
            hotKey: "E",
        },
        {
            name: "圆形",
            hotKey: "C",
        },
        {
            name: "矩形",
            hotKey: "R",
        },
        {
            name: "箭头",
            hotKey: "A",
        },
        {
            name: "直线",
            hotKey: "L",
        },
        {
            name: "激光笔",
            hotKey: "Z",
        },
        {
            name: "抓手",
            hotKey: "H",
        },
    ],
    edit: [
        {
            name: "删除所选对象",
            hotKey: "Backspace / Delete",
        },
        {
            name: "等比例缩放",
            hotKey: "Shift / ⇧",
        },
        {
            name: "撤销",
            hotKey: "Ctrl + Z / ⌘ + Z",
        },
        {
            name: "重做",
            hotKey: "Ctrl + Y / ⌘ + Y",
        },
        {
            name: "复制",
            hotKey: "Ctrl + C / ⌘ + C",
        },
        {
            name: "粘贴",
            hotKey: "Ctrl + V / ⌘ + V",
        },
    ],
};

const HotKeyTableKeys = Object.freeze(Object.keys(HotKeyTableExpandRow));

// gen key of expanded table
HotKeyTableKeys.forEach((data: string) => {
    HotKeyTableExpandRow[data].forEach((row: HotKey, index) => {
        row.key = `${row.name + String(index)}`;
    });
});

const tableRow: HotKeyTable[] = HotKeyTableKeys.map((data: string, index) => {
    return {
        name: data,
        key: `${data + String(index)}`,
        desc: HotKeyTableRow[index],
    };
});

const expandedRowRender = (row: HotKeyTable): React.ReactElement => {
    return (
        <Table
            columns={HotKeyTableExpandTitleList}
            dataSource={HotKeyTableExpandRow[row.name]}
            pagination={false}
        />
    );
};

export const HotKeySettingPage = (): React.ReactElement => {
    return (
        <UserSettingLayoutContainer>
            <div className="hotkey-setting-container">
                <div className="hotkey-setting-content">
                    <Table
                        columns={HotKeyTableTitleList}
                        dataSource={tableRow}
                        expandable={{ expandedRowRender }}
                        pagination={false}
                        scroll={{ y: 500 }}
                    />
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

export default HotKeySettingPage;
