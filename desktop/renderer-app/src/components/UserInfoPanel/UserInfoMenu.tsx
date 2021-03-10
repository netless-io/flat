import React from "react";
import "./UserInfoMenu.less";
import { Menu } from "antd";
import { MenuMap } from "../../UserInfoPage";

type UserInfoMenuProps = { menu: MenuMap; setMenu: (tab: MenuMap) => void };

export default class UserInfoMenu extends React.PureComponent<UserInfoMenuProps> {
    public render(): JSX.Element {
        return (
            <div className="user-info-menu-container">
                <Menu
                    selectedKeys={[this.props.menu]}
                    mode="inline"
                    className="menu-item-container"
                >
                    <Menu.Item
                        key={MenuMap.UserInfo}
                        onClick={() => this.props.setMenu(MenuMap.UserInfo)}
                    >
                        个人信息
                    </Menu.Item>
                    <Menu.Item
                        key={MenuMap.CheckUpdate}
                        onClick={() => this.props.setMenu(MenuMap.CheckUpdate)}
                    >
                        检查升级
                    </Menu.Item>
                    <Menu.Item
                        key={MenuMap.Suggest}
                        onClick={() => this.props.setMenu(MenuMap.Suggest)}
                    >
                        吐个槽
                    </Menu.Item>
                    <Menu.Item
                        key={MenuMap.About}
                        onClick={() => this.props.setMenu(MenuMap.About)}
                    >
                        关于我们
                    </Menu.Item>
                </Menu>
            </div>
        );
    }
}
