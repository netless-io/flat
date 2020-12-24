import React from "react";
import "./MainPageLayout.less";
import { MainMenu } from "./MainMenu";
import classNames from "classnames";
import { getWechatInfo } from "../utils/localStorage/accounts";

export type MainPageLayoutProps = {
    columnLayout?: boolean;
};

export default class MainPageLayout extends React.PureComponent<MainPageLayoutProps> {
    private userAvatar: string;
    public constructor(props: MainPageLayoutProps) {
        super(props);
        this.userAvatar = getWechatInfo()?.avatar ?? '';
    }
    public render() {
        return (
            <div className="layout-container">
                <div className="layout-container-menu">
                    <div className="layout-container-header">
                        <img src={this.userAvatar} alt="avatar" />
                    </div>
                    <MainMenu />
                </div>
                <div
                    className={classNames("layout-container-content", {
                        "flex-column": this.props.columnLayout,
                    })}
                >
                    {this.props.children}
                </div>
            </div>
        );
    }
}
