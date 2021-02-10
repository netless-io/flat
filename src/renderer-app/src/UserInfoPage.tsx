import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import UserInfoTab from "./components/UserInfoPanel/UserInfoTab";
import UserInfoContent from "./components/UserInfoPanel/UserInfoContent";
import UserCheckUpdate from "./components/UserInfoPanel/UserCheckUpdate";
import UserSeggest from "./components/UserInfoPanel/UserSuggest";
import UserAbout from "./components/UserInfoPanel/UserAbout";
// import UserInfoMsg from "./components/UserInfoPanel/UserInfoMsg";

// UserInfo = "个人信息",
export enum TabMap {
    CheckUpdate = "检查更新",
    Suggest = "吐个槽",
    About = "关于我们",
}

export type UserInfoPageProps = {
    tab: TabMap;
};

export default class UserInfoPage extends React.PureComponent<{}, UserInfoPageProps> {
    constructor(props: {}) {
        super(props);
        this.state = { tab: TabMap.CheckUpdate };
    }

    public setTab = (tab: TabMap): void => {
        this.setState({ tab });
    };

    public renderContent = (): React.ReactNode => {
        switch (this.state.tab) {
            // case TabMap.UserInfo: {
            //     return <UserInfoMsg />;
            // }
            case TabMap.CheckUpdate: {
                return <UserCheckUpdate />;
            }
            case TabMap.Suggest: {
                return <UserSeggest />;
            }
            case TabMap.About: {
                return <UserAbout />;
            }
            default:
                return null;
        }
    };

    public render(): JSX.Element {
        return (
            <MainPageLayout>
                <div className="user-info-wrapper">
                    <UserInfoTab tab={this.state.tab} setTab={this.setTab} />
                    <UserInfoContent tab={this.state.tab}>{this.renderContent()}</UserInfoContent>
                </div>
            </MainPageLayout>
        );
    }
}
