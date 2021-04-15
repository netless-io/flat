import React from "react";
import { Switch, Route, Link, useLocation } from "react-router-dom";
import "./index.less";
import { Menu } from "antd";
import MainPageLayout from "../../components/MainPageLayout";
import { FileSetting } from "./FileSetting";
import { HotKeySetting } from "./HotKeySetting";
import { RoomSetting } from "./RoomSetting";
import { NormalSetting } from "./NormalSetting";
import { useWindowSize } from "../../utils/hooks/useWindowSize";

export enum SettingMenuKey {
    NormalSetting = "/setting/normal/",
    RoomSetting = "/setting/room/",
    HotKeySetting = "/setting/hotkey/",
    FileSetting = "/setting/file/",
    SystemTesting = "/setting/system/",
    CameraTesting = "/setting/camera/",
    SpeakerTesting = "/setting/speaker/",
    MicrophoneTesting = "/setting/microphone/",
}

export enum TestingResult {
    Undefined = -1,
    Success = 0,
    Fail = 1,
}

export default function UserSettingPage(): React.ReactElement {
    useWindowSize("Main");

    const location = useLocation();
    function renderSettingMenu(): JSX.Element {
        const key = location.pathname;
        return (
            <Menu selectedKeys={[key]} mode="inline" className="menu-item-container">
                <Menu.Item key={SettingMenuKey.NormalSetting}>
                    <Link to="/setting/normal/">常规设置</Link>
                </Menu.Item>
                {/* <Menu.Item key={SettingMenuKey.RoomSetting}>
                    <Link to="/setting/room/">房间设置</Link>
                </Menu.Item> */}
                <Menu.Item key={SettingMenuKey.HotKeySetting}>
                    <Link to="/setting/hotkey/">热键设置</Link>
                </Menu.Item>
                {/* <Menu.Item key={SettingMenuKey.FileSetting}>
                    <Link to="/setting/file/">文件设置</Link>
                </Menu.Item> */}
            </Menu>
        );
    }

    return (
        <MainPageLayout>
            <div className="setting-menu-container">{renderSettingMenu()}</div>
            <div className="setting-content-container">
                <Switch>
                    <Route exact path="/setting/normal/" component={NormalSetting} />
                    <Route exact path="/setting/room/" component={RoomSetting} />
                    <Route exact path="/setting/hotkey/" component={HotKeySetting} />
                    <Route exact path="/setting/file/" component={FileSetting} />
                </Switch>
            </div>
        </MainPageLayout>
    );
}
