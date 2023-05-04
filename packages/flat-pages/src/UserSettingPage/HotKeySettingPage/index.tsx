import "./index.less";

import React from "react";
import { Table } from "antd";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { useHotKeyData, HotKeyTable } from "./useHotKeyData";

export const HotKeySettingPage = (): React.ReactElement => {
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
