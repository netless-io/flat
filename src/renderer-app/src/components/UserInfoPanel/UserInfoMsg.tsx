import React from "react";
import "./UserInfoMsg.less";
import { Button, Input } from "antd";

export default class UserInfoMsg extends React.PureComponent<{}> {
    public render(): JSX.Element {
        return (
            <div className="user-info-msg-container">
                <div className="user-nickname-box">
                    <div>昵称</div>
                    <Input placeholder="请输入昵称"></Input>
                    <Button type="primary">提交</Button>
                </div>
                <div className="user-wechat-info-box">
                    <div>微信</div>
                    <div>cheerego</div>
                </div>
                <div className="user-google-info-box">
                    <div>Google</div>
                    <a>立即绑定</a>
                </div>
            </div>
        );
    }
}
