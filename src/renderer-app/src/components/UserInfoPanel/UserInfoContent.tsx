import React from "react";
import "./UserInfoContent.less";
import { TabMap } from "../../UserInfoPage";

export type UserInfoContentProps = {
    userInfo: TabMap;
    checkUpdate: TabMap;
    suggest: TabMap;
    about: TabMap;
};

export default class UserInfoContent extends React.PureComponent<
    { tab: TabMap },
    UserInfoContentProps
> {
    public render(): JSX.Element {
        return (
            <div className="info-content-container">
                <div className="info-content-header">
                    <span>{this.props.tab}</span>
                </div>
                <div className="info-content-inner">{this.props.children}</div>
            </div>
        );
    }
}
