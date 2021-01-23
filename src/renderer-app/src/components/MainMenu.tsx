import React, { PureComponent } from "react";
import { Menu } from "antd";
import home from "../assets/image/home.svg";
import homeActive from "../assets/image/home-active.svg";
import user from "../assets/image/user.svg";
import userActive from "../assets/image/user-active.svg";
import setting from "../assets/image/setting.svg";
import settingActive from "../assets/image/setting-active.svg";
import { Link } from "react-router-dom";

export enum MainMenuKey {
    InfoPath = "/user/",
    MyPath = "/info/",
    SettingPath = "/setting/",
}

export class MainMenu extends PureComponent<{}> {
    render(): JSX.Element {
        let key = "";
        const hash = window.location.hash.substring(1);
        if (/^\/user/.test(hash)) {
            key = "/user/";
        } else if (/^\/info/.test(hash)) {
            key = "/info/";
        } else if (/^\/setting/.test(hash)) {
            key = "/setting/";
        }

        return (
            <Menu className="menu-container" defaultSelectedKeys={[key]}>
                <Menu.Item
                    icon={<img src={key === "/user/" ? homeActive : home} alt={"home"} />}
                    key={MainMenuKey.InfoPath}
                >
                    <Link to="/user/">
                        <span>首页</span>
                    </Link>
                </Menu.Item>
                <Menu.Item
                    icon={<img src={key === "/info/" ? userActive : user} alt={"user"} />}
                    key={MainMenuKey.MyPath}
                >
                    <Link to="/info/">
                        <span>我的</span>
                    </Link>
                </Menu.Item>
                <Menu.Item
                    icon={
                        <img src={key === "/setting/" ? settingActive : setting} alt={"setting"} />
                    }
                    key={MainMenuKey.SettingPath}
                >
                    <Link to="/setting/normal/">
                        <span>设置</span>
                    </Link>
                </Menu.Item>
            </Menu>
        );
    }
}
