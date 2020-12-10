import React from "react";
import Avatar from "antd/lib/avatar/avatar";
import theme from "../assets/image/theme.svg";
import exit from "../assets/image/exit.svg";
import "./MainHeader.less";

export class MainHeader extends React.PureComponent<{}> {
    public render() {
        return (
            <div className="main-header-inner">
                <Avatar size={28} />
                <span>nickName</span>
                {/* <div>EN</div> */}
                <div className="main-header-inner-right">
                    <img src={theme} alt="theme" />
                    <img src={exit} alt="exit" />
                </div>
            </div>
        );
    }
}
