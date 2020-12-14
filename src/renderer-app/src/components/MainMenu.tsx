import React from "react";
import { Menu } from "antd";
import home from "../assets/image/home.svg"
import homeActive from "../assets/image/home-active.svg"
import user from "../assets/image/user.svg"
import userActive from "../assets/image/user-active.svg"
import setting from "../assets/image/setting.svg"
import settingActive from "../assets/image/setting-active.svg"
import { Link } from "react-router-dom";

export enum MainMenuKey {
    infoPath = "/user/",
    myPath = "/user/info/",
    settingPath = "/user/setting/"
}

export class MainMenu extends React.PureComponent<{}> {
    render() {
        const key = window.location.hash.substring(1)
        return (
            <Menu className="menu-container" defaultSelectedKeys={[key]}>
                <Menu.Item icon={<img src={key === "/user/" ? homeActive : home} />} key={MainMenuKey.infoPath}>
                    <Link to="/user/">
                        <span>首页</span>
                    </Link>    
                </Menu.Item>
                <Menu.Item icon={<img src={key === "/user/info/" ? userActive : user} />} key={MainMenuKey.myPath}>
                    <Link to="/user/info/">
                        <span>我的</span>
                    </Link>
                </Menu.Item>
                <Menu.Item icon={<img src={key === "/user/setting/" ? settingActive : setting} />} key={MainMenuKey.settingPath}>
                    <Link to="/user/setting/">
                        <span>设置</span>
                    </Link>
                </Menu.Item>
            </Menu>
        )
    }
}