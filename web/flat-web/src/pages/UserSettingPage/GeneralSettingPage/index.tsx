import "./index.less";

import { Radio } from "antd";
import React from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
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

export default GeneralSettingPage;
