import React, { useEffect, useState } from "react";
import "./NormalSetting.less";
import { Radio, Checkbox, Button } from "antd";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { ipcAsyncByApp, ipcSyncByApp } from "../../utils/ipc";

// enum NoticeInterval {
//     FiveMinutes,
//     FifteenMinutes,
//     ThirtyMinutes,
// }

enum SelectLanguage {
    Chinese,
    English,
}

export const NormalSetting = observer(function NormalSetting() {
    // const [scheduleNotice, setScheduleNotice] = useState(false);
    const [openAtLogin, setOpenAtLogin] = useState(false);
    const history = useHistory();

    // const toggleScheduleNotice = (): void => {
    //     setScheduleNotice(!scheduleNotice);
    // };

    // const updateNotice = (e: RadioChangeEvent): void => {
    //     // TODO: need handle
    //     console.log(e.target.value);
    // };

    useEffect(() => {
        ipcSyncByApp("get-open-at-login")
            .then(data => {
                setOpenAtLogin(data);
            })
            .catch(err => {
                console.error("ipc failed", err);
            });
    }, []);

    const toggleOpenAtLogin = (): void => {
        setOpenAtLogin(!openAtLogin);
        ipcAsyncByApp("set-open-at-login", {
            isOpenAtLogin: !openAtLogin,
        });
    };

    const quitAccount = (): void => {
        localStorage.clear();
        history.push("/login/");
    };

    return (
        <div className="content-container">
            <div className="header-container">
                <span>常规设置</span>
            </div>
            <div className="inner-container">
                <span>常规设置</span>
                <Checkbox onClick={toggleOpenAtLogin} checked={openAtLogin}>
                    开机自动运行
                </Checkbox>
                {/*TODO: Do the next version*/}
                {/*<div className="book-notice">*/}
                {/*    <Checkbox onClick={toggleScheduleNotice}>开启预订通知</Checkbox>*/}
                {/*    <Radio.Group*/}
                {/*        onChange={updateNotice}*/}
                {/*        disabled={!scheduleNotice}*/}
                {/*        defaultValue={NoticeInterval.FiveMinutes}*/}
                {/*    >*/}
                {/*        <Radio value={NoticeInterval.FiveMinutes} defaultChecked={false}>*/}
                {/*            提前 5 分钟*/}
                {/*        </Radio>*/}
                {/*        <Radio value={NoticeInterval.FifteenMinutes} defaultChecked={false}>*/}
                {/*            提前 15 分钟*/}
                {/*        </Radio>*/}
                {/*        <Radio value={NoticeInterval.ThirtyMinutes} defaultChecked={false}>*/}
                {/*            提前 30 分钟*/}
                {/*        </Radio>*/}
                {/*    </Radio.Group>*/}
                {/*</div>*/}
                {/*<Checkbox>开启预订通知提醒声音</Checkbox>*/}
                <div className="select-language">
                    <span>语言设置</span>
                    <Radio.Group>
                        <Radio value={SelectLanguage.Chinese}>中文</Radio>
                        <Radio value={SelectLanguage.English}>English</Radio>
                    </Radio.Group>
                    <Button danger onClick={quitAccount}>
                        退出登录
                    </Button>
                </div>
            </div>
        </div>
    );
});
