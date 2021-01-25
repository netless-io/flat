import React from "react";
import { Switch, Route, Link, RouteComponentProps } from "react-router-dom";
import "./index.less";
import { Menu } from "antd";
import MainPageLayout from "../../components/MainPageLayout";
import { FileSetting } from "./FileSetting";
import { HotKeySetting } from "./HotKeySetting";
import { RoomSetting } from "./RoomSetting";
import { SystemTesting } from "./SystemTesting";
import { NormalSetting } from "./NormalSetting";
import { CameraTesting } from "./CameraTesting";
import { SpeakerTesting } from "./SpeakerTesting";
import { MicrophoneTesting } from "./MicrophoneTesting";

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

export default class UserSetPage extends React.PureComponent<RouteComponentProps<{}>> {
    public renderSettingMenu(): JSX.Element {
        const { SubMenu } = Menu;
        const key = this.props.location.pathname;
        return (
            <Menu selectedKeys={[key]} mode="inline" className="menu-item-container">
                <Menu.Item key={SettingMenuKey.NormalSetting}>
                    <Link to="/setting/normal/">常规设置</Link>
                </Menu.Item>
                <Menu.Item key={SettingMenuKey.RoomSetting}>
                    <Link to="/setting/room/">房间设置</Link>
                </Menu.Item>
                <Menu.Item key={SettingMenuKey.HotKeySetting}>
                    <Link to="/setting/hotkey/">热键设置</Link>
                </Menu.Item>
                <Menu.Item key={SettingMenuKey.FileSetting}>
                    <Link to="/setting/file/">文件设置</Link>
                </Menu.Item>
                <SubMenu title="设备检测" key="DeviceTesting">
                    <Menu.Item key={SettingMenuKey.SystemTesting}>
                        <Link to="/setting/system/">系统检测</Link>
                    </Menu.Item>
                    <Menu.Item key={SettingMenuKey.CameraTesting}>
                        <Link to="/setting/camera/">摄像头检测</Link>
                    </Menu.Item>
                    <Menu.Item key={SettingMenuKey.SpeakerTesting}>
                        <Link to="/setting/speaker/">扬声器检测</Link>
                    </Menu.Item>
                    <Menu.Item key={SettingMenuKey.MicrophoneTesting}>
                        <Link to="/setting/microphone/">麦克风检测</Link>
                    </Menu.Item>
                </SubMenu>
            </Menu>
        );
    }

    public render(): JSX.Element {
        return (
            <MainPageLayout>
                <div className="setting-menu-container">{this.renderSettingMenu()}</div>
                <div className="setting-content-container">
                    <Switch>
                        <Route exact path="/setting/normal/" component={NormalSetting} />
                        <Route exact path="/setting/room/" component={RoomSetting} />
                        <Route exact path="/setting/hotkey/" component={HotKeySetting} />
                        <Route exact path="/setting/file/" component={FileSetting} />
                        <Route exact path="/setting/system/" component={SystemTesting} />
                        <Route exact path="/setting/camera/" component={CameraTesting} />
                        <Route exact path="/setting/speaker/" component={SpeakerTesting} />
                        <Route exact path="/setting/microphone/" component={MicrophoneTesting} />
                    </Switch>
                </div>
            </MainPageLayout>
        );
    }
}
