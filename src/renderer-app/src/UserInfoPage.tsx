import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import UserInfoContent from "./components/UserInfoPanel/UserInfoContent";
import UserCheckUpdate from "./components/UserInfoPanel/UserCheckUpdate";
import UserSeggest from "./components/UserInfoPanel/UserSuggest";
import UserAbout from "./components/UserInfoPanel/UserAbout";
import UserInfoMsg from "./components/UserInfoPanel/UserInfoMsg";
import UserInfoMenu from "./components/UserInfoPanel/UserInfoMenu";

export enum MenuMap {
    UserInfo = "个人信息",
    CheckUpdate = "检查更新",
    Suggest = "吐个槽",
    About = "关于我们",
}

export type UserInfoPageProps = {
    menu: MenuMap;
};

export default class UserInfoPage extends React.PureComponent<{}, UserInfoPageProps> {
    constructor(props: {}) {
        super(props);
        this.state = { menu: MenuMap.UserInfo };
    }

    public setMenu = (menu: MenuMap): void => {
        this.setState({ menu });
    };

    public renderContent = (): React.ReactNode => {
        switch (this.state.menu) {
            case MenuMap.UserInfo: {
                return <UserInfoMsg />;
            }
            case MenuMap.CheckUpdate: {
                return <UserCheckUpdate />;
            }
            case MenuMap.Suggest: {
                return <UserSeggest />;
            }
            // case MenuMap.About: {
            //     return <UserAbout />;
            // }
            default:
                return null;
        }
    };

    public render(): JSX.Element {
        return (
            <MainPageLayout>
                <div className="user-info-wrapper">
                    <UserInfoMenu menu={this.state.menu} setMenu={this.setMenu} />
                    <UserInfoContent menu={this.state.menu}>{this.renderContent()}</UserInfoContent>
                    <UserAbout />
                </div>
            </MainPageLayout>
        );
    }
}
