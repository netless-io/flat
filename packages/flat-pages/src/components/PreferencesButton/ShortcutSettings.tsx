import React, { FC } from "react";
import { Table } from "antd";

import { useTranslate } from "@netless/flat-i18n";
import { HotKeyTable, useHotKeyData } from "../../UserSettingPage/HotKeySettingPage/useHotKeyData";

export const ShortcutSettings: FC = () => {
    const t = useTranslate();
    const { HotKeyTableExpandRow, HotKeyTableExpandTitleList, HotKeyTableTitleList, tableRow } =
        useHotKeyData();

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
        <div className="preferences-modal-section" id="preferences-4">
            <h3 className="preferences-modal-section-title">{t("shortcut-settings")}</h3>
            <div className="preferences-modal-hotkey-setting-content">
                <Table
                    columns={HotKeyTableTitleList}
                    dataSource={tableRow}
                    expandable={{ expandedRowRender }}
                    pagination={false}
                    scroll={{ y: 500 }}
                />
            </div>
        </div>
    );
};
