import React, { useState } from "react";
import { Switch, Route, Link, useLocation, useHistory } from "react-router-dom";
import "./index.less";
import { Button, Menu, Modal } from "antd";
import MainPageLayout from "../../components/MainPageLayout";
import { FileSetting } from "./FileSetting";
import { HotKeySetting } from "./HotKeySetting";
import { RoomSetting } from "./RoomSetting";
import { SystemTesting } from "./SystemTesting";
import { NormalSetting } from "./NormalSetting";
import { CameraTesting } from "./CameraTesting";
import { SpeakerTesting } from "./SpeakerTesting";
import { MicrophoneTesting } from "./MicrophoneTesting";
import info from "../../assets/image/info.svg";
import success from "../../assets/image/success.svg";

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

const { SubMenu } = Menu;

export default function UserSettingPage(): React.ReactElement {
    const location = useLocation();
    const [system, setSystem] = useState<string | null>(null);
    const [camera, setCamera] = useState<TestingResult>(TestingResult.Undefined);
    const [speaker, setSpeaker] = useState<TestingResult>(TestingResult.Undefined);
    const [microphone, setMicrophone] = useState<TestingResult>(TestingResult.Undefined);
    const [resultModalVisible, showResultModal] = useState(false);
    const history = useHistory();

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

    function onMicrophoneChange(microphone: TestingResult): void {
        setMicrophone(microphone);
        showResultModal(true);
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
                    <Route exact path="/setting/system/">
                        <SystemTesting onChange={setSystem} />
                    </Route>
                    <Route exact path="/setting/camera/">
                        <CameraTesting onChange={setCamera} />
                    </Route>
                    <Route exact path="/setting/speaker/">
                        <SpeakerTesting onChange={setSpeaker} />
                    </Route>
                    <Route exact path="/setting/microphone/">
                        <MicrophoneTesting onChange={onMicrophoneChange} />
                    </Route>
                </Switch>
            </div>
            <Modal
                width={368}
                className="user-setting-modal"
                visible={resultModalVisible}
                title={renderTitle()}
                footer={renderFooter()}
                onOk={() => showResultModal(false)}
                onCancel={() => showResultModal(false)}
            >
                <div className="table">
                    <div className="left">系统检测</div>
                    <div className="middle">{renderDescription(system)}</div>
                    <div className="right">{renderSummary(system)}</div>
                    <div className="left">摄像头检测</div>
                    <div className="middle">{renderDescription(camera)}</div>
                    <div className="right">{renderSummary(camera)}</div>
                    <div className="left">扬声器检测</div>
                    <div className="middle">{renderDescription(speaker)}</div>
                    <div className="right">{renderSummary(speaker)}</div>
                    <div className="left">麦克风检测</div>
                    <div className="middle">{renderDescription(microphone)}</div>
                    <div className="right">{renderSummary(microphone)}</div>
                </div>
            </Modal>
        </MainPageLayout>
    );

    function renderTitle(): React.ReactNode {
        const isSuccess =
            system === "" &&
            camera === TestingResult.Success &&
            speaker === TestingResult.Success &&
            microphone === TestingResult.Success;

        if (isSuccess) {
            return (
                <div className="user-setting-modal-title">
                    <img src={success} alt="success" />
                    设备检测成功
                </div>
            );
        } else {
            return (
                <div className="user-setting-modal-title">
                    <img src={info} alt="info" />
                    设备检测异常
                </div>
            );
        }
    }

    function reset(): void {
        showResultModal(false);
        setSystem(null);
        setCamera(TestingResult.Undefined);
        setSpeaker(TestingResult.Undefined);
        setMicrophone(TestingResult.Undefined);
        history.push("/setting/system/");
    }

    function renderFooter(): React.ReactNode {
        const isSuccess =
            system === "" &&
            camera === TestingResult.Success &&
            speaker === TestingResult.Success &&
            microphone === TestingResult.Success;

        if (!isSuccess) {
            return (
                <Button type="primary" onClick={reset} className="user-setting-modal-button">
                    重新检测
                </Button>
            );
        } else {
            return (
                <Button
                    type="primary"
                    onClick={() => showResultModal(false)}
                    className="user-setting-modal-button"
                >
                    确定
                </Button>
            );
        }
    }

    function renderDescription(result: null | TestingResult | string): React.ReactNode {
        if (result === null || result === TestingResult.Undefined) {
            return <span className="red">未检测</span>;
        }
        if (result === TestingResult.Fail) {
            return <span className="red">检测失败</span>;
        }
        if (typeof result === "string" && result.length > 0) {
            return <span className="red">{result}</span>;
        }
        return <span className="success"></span>;
    }

    function renderSummary(result: null | TestingResult | string): React.ReactNode {
        if (
            result === null ||
            result === TestingResult.Undefined ||
            result === TestingResult.Fail ||
            (typeof result === "string" && result.length > 0)
        ) {
            return <span className="red">异常</span>;
        }
        return <span className="green">正常</span>;
    }
}
