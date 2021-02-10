import React from "react";
import "./UserInfoTab.less";
import { Tabs } from "antd";
import { TabMap } from "../../UserInfoPage";

type UserInfoTabProps = { tab: TabMap; setTab: (tab: TabMap) => void };

export default class UserInfoTab extends React.PureComponent<UserInfoTabProps> {
    public render(): JSX.Element {
        const { TabPane } = Tabs;

        return (
            <div className="user-info-container">
                <div className="user-info-menu">
                    <Tabs
                        activeKey={this.props.tab}
                        onChange={key => this.props.setTab(key as TabMap)}
                        tabPosition="left"
                    >
                        <TabPane tab="个人信息" key={TabMap.UserInfo}></TabPane>
                        <TabPane tab="检查更新" key={TabMap.CheckUpdate}></TabPane>
                        <TabPane tab="吐个槽" key={TabMap.Suggest}></TabPane>
                        <TabPane tab="关于我们" key={TabMap.About}></TabPane>
                    </Tabs>
                </div>
            </div>
        );
    }
}
