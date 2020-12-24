import React from "react"
import "./NormalSetting.less"
import { Radio, Checkbox, Button } from "antd"
import { RouteComponentProps } from "react-router";

enum RadioValue {
    FiveMinutes="提前 5 分钟",
    Fifteeninutes="提前 15 分钟",
    ThirtyMinutes="提前 30 分钟"
}

enum Selectlanguage {
    Chinese = "中文",
    English = "英语"
}

type NoramlSettingState = {
    toggleRadio: boolean;
    radioValue: RadioValue;
}

export default class NormalSetting extends React.PureComponent<RouteComponentProps, NoramlSettingState> {
    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            toggleRadio: true,
            radioValue: RadioValue.FiveMinutes,
        };
    }

    public toggleRadio = () => {
        this.setState({
            toggleRadio: !this.state.toggleRadio,
        });
    };

    public quitAccount = () => {
        localStorage.clear();
        this.props.history.push("/login/");
    }

    public render() {
        return (
            <div className="content-container">
                <div className="header-container">
                    <span>常规设置</span>
                </div>
                <div className="inner-container">
                    <span>常规设置</span>
                    <Checkbox>开机自动运行</Checkbox>
                    <div className="book-notice">
                        <Checkbox onClick={this.toggleRadio}>开启预订通知</Checkbox>
                        <Radio.Group>
                            <Radio
                                value={RadioValue.FiveMinutes}
                                defaultChecked={false}
                                disabled={this.state.toggleRadio}
                            >
                                提前 5 分钟
                            </Radio>
                            <Radio
                                value={RadioValue.Fifteeninutes}
                                defaultChecked={false}
                                disabled={this.state.toggleRadio}
                            >
                                提前 15 分钟
                            </Radio>
                            <Radio
                                value={RadioValue.ThirtyMinutes}
                                defaultChecked={false}
                                disabled={this.state.toggleRadio}
                            >
                                提前 30 分钟
                            </Radio>
                        </Radio.Group>
                    </div>
                    <Checkbox>开启预订通知提醒声音</Checkbox>
                    <div className="select-language">
                        <span>语言设置</span>
                        <Radio.Group>
                            <Radio value={Selectlanguage.Chinese}>中文</Radio>
                            <Radio value={Selectlanguage.English}>English</Radio>
                        </Radio.Group>
                        <Button danger onClick={this.quitAccount}>退出登录</Button>
                    </div>
                </div>
            </div>
        );
    }
}
