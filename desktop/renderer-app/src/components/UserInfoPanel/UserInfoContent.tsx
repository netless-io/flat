import React from "react";
import "./UserInfoContent.less";
import { MenuMap } from "../../UserInfoPage";

export type UserInfoContentProps = {
    userInfo: MenuMap;
    checkUpdate: MenuMap;
    suggest: MenuMap;
    about: MenuMap;
};

export default class UserInfoContent extends React.PureComponent<
    { menu: MenuMap },
    UserInfoContentProps
> {
    public render(): JSX.Element {
        return (
            <div className="info-content-container">
                <div className="info-content-header">
                    <span>{this.props.menu}</span>
                </div>
                <div className="info-content-inner">{this.props.children}</div>
            </div>
        );
    }
}
