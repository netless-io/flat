import React from "react"
import MainPageLayout from "./components/MainPageLayout"
import UserInfoTab from "./components/UserInfoPanel/UserInfoTab"
import UserInfoContent from "./components/UserInfoPanel/UserInfoContent"
import UserCheckUpdate from "./components/UserInfoPanel/UserCheckUpdate"
import UserSeggest from "./components/UserInfoPanel/UserSuggest"
import UserAbout from "./components/UserInfoPanel/UserAbout"
import UserInfoMsg from "./components/UserInfoPanel/UserInfoMsg"

export enum TabMap {
    userInfo = "个人信息",
    checkUpdate = "检查更新",
    suggest = "吐个槽",
    about = "关于我们",
}

export default class UserInfoPage extends React.PureComponent<{}, { tab: TabMap }> {
    constructor(props: {}) {
        super(props)
        this.state = { tab: TabMap.userInfo }
    }

    public setTab = (tab: TabMap) => {
        this.setState({ tab })
    }

    public renderContent = (): React.ReactNode =>  {
        switch (this.state.tab) {
            case TabMap.userInfo: {
                return <UserInfoMsg />;
            }
            case TabMap.checkUpdate: {
                return <UserCheckUpdate/>
            }
            case TabMap.suggest: {
                return <UserSeggest />
            }
            case TabMap.about: {
                return <UserAbout />
            }
            default: 
                return null;
        }
    }

    public render() {
        return (
            <MainPageLayout>
                <div className="user-info-wrapper">
                    <UserInfoTab tab={this.state.tab} setTab={this.setTab} />
                    <UserInfoContent tab={this.state.tab}>
                        {this.renderContent()}
                    </UserInfoContent>
                </div>
            </MainPageLayout>
        )
    }
}