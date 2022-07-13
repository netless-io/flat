import "./index.less";

import { Table } from "antd";
import React from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { useTranslation } from "react-i18next";

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

export const HotKeySettingPage = (): React.ReactElement => {
    const { t } = useTranslation();

    const HotKeyTableTitleList = [
        {
            title: t("shortcut-name"),
            dataIndex: "desc",
        },
        {
            title: t("shortcut-tips"),
            dataIndex: "",
        },
    ];

    const HotKeyTableRow = [t("toolbar"), t("editor")];

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
                name: t("tool-selector"),
                hotKey: "S",
            },
            {
                name: t("tool-pen"),
                hotKey: "P",
            },
            {
                name: t("tool-eraser"),
                hotKey: "E",
            },
            {
                name: t("tool-circle"),
                hotKey: "C",
            },
            {
                name: t("tool-rectangle"),
                hotKey: "R",
            },
            {
                name: t("tool-arrow"),
                hotKey: "A",
            },
            {
                name: t("tool-line"),
                hotKey: "L",
            },
            {
                name: t("tool-laser-pointer"),
                hotKey: "Z",
            },
            {
                name: t("tool-hand"),
                hotKey: "H",
            },
        ],
        edit: [
            {
                name: t("delete-object"),
                hotKey: "Backspace / Delete",
            },
            {
                name: t("proportional-zoom"),
                hotKey: "Shift / ⇧",
            },
            {
                name: t("switch-to-next-color"),
                hotKey: "Alt + Q / ⌥ + Q",
            },
            {
                name: t("switch-to-previous-color"),
                hotKey: "Alt + Shift + Q / ⌥ + Shift + Q",
            },
            {
                name: t("pencil-tool-draws-circle"),
                hotKey: "Shift + Mouse",
            },
            {
                name: t("draw-circles-from-center"),
                hotKey: "Ctrl + Mouse / ⌘ + Mouse ",
            },
            {
                name: t("undo"),
                hotKey: "Ctrl + Z / ⌘ + Z",
            },
            {
                name: t("redo"),
                hotKey: "Ctrl + Y / ⌘ + Y",
            },
            {
                name: t("copy"),
                hotKey: "Ctrl + C / ⌘ + C",
            },
            {
                name: t("paste"),
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
