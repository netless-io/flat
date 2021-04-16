import "./index.less";

import React, { useState } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { Button, Input } from "antd";

export const FeedbackPage = (): React.ReactElement => {
    const { TextArea } = Input;

    const [textValue, setTextValue] = useState<string>("");

    return (
        <UserSettingLayoutContainer>
            <div className="feedback-page-container">
                <TextArea
                    value={textValue}
                    onChange={evt => setTextValue(evt.target.value)}
                    size="large"
                    placeholder="请输入内容..."
                    rows={9}
                ></TextArea>
            </div>
            <div className="feedback-page-btn">
                <Button disabled={textValue === ""} type="primary">
                    提交
                </Button>
            </div>
        </UserSettingLayoutContainer>
    );
};
