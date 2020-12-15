import React from "react";
import "./MainPageLayout.less";
import { MainMenu } from "./MainMenu";

export type MainPageLayoutProps = {};

export default class MainPageLayout extends React.PureComponent<MainPageLayoutProps> {
    public render() {
        return (
            <div className="layout-container">
                <div className="layout-container-menu">
                    <MainMenu />
                </div>
                <div className="layout-container-content">{this.props.children}</div>
            </div>
        );
    }
}
