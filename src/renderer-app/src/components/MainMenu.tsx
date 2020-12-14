import React from "react";
import { Menu } from "antd";
import home from "../assets/image/home.svg"
import user from "../assets/image/user.svg"
import setting from "../assets/image/setting.svg"
import { Link } from "react-router-dom";

export enum MainMenuKey {
    infoPath = "/user/",
    myPath = "/user/info/",
    settingPath = "/user/setting/"
}

export class MainMenu extends React.PureComponent<{}> {
    render() {
        const hash = window.location.hash
        
        return (
            <Menu className="menu-container" defaultSelectedKeys={[hash.substring(1)]}>
                <Menu.Item icon={<img src={home} />} key={MainMenuKey.infoPath}>
                    <Link to="/user/">
                        <span>首页</span>
                    </Link>    
                </Menu.Item>
                <Menu.Item icon={<img src={user} />} key={MainMenuKey.myPath}>
                    <Link to="/user/info/">
                        <span>我的</span>
                    </Link>
                </Menu.Item>
                <Menu.Item icon={<img src={setting} />} key={MainMenuKey.settingPath}>
                    <Link to="/user/setting/">
                        <span>设置</span>
                    </Link>
                </Menu.Item>
            </Menu>
        )
    }
}