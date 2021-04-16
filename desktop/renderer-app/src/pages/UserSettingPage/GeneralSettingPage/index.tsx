import "./index.less";

import { Checkbox, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { ipcSyncByApp, ipcAsyncByApp } from "../../../utils/ipc";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const [openAtLogin, setOpenAtLogin] = useState(false);

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

    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
                <div className="general-setting-checkbox">
                    <Checkbox onClick={toggleOpenAtLogin} checked={openAtLogin}>
                        开机自动运行
                    </Checkbox>
                </div>
                <div className="general-setting-select-language">
                    <span>语言设置</span>
                    <Radio.Group defaultValue={SelectLanguage.Chinese}>
                        <Radio value={SelectLanguage.Chinese}>中文</Radio>
                        <Radio disabled value={SelectLanguage.English}>
                            English
                        </Radio>
                    </Radio.Group>
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};
