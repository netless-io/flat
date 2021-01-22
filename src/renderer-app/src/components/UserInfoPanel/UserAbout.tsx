import React from "react";
import logo from "../../assets/image/logo-large.svg";
import "./UserAbout.less";
export default class UserAbout extends React.PureComponent {
    public render(): JSX.Element {
        return (
            <div className="check-update-container">
                <div className="check-update-logo">
                    <img src={logo} alt="flat web logo" />
                    <div className="check-update-info">
                        <a>服务协议</a>
                        <span>|</span>
                        <a>隐私政策</a>
                    </div>
                </div>
                <div className="check-update-footer">
                    © 2020 Netless 沪 ICP 备 19010127 号 - 2 沪公网安备 31011002004621 号
                </div>
            </div>
        );
    }
}
