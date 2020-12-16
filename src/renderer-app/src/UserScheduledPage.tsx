import "./UserScheduledPage.less";
import React, { Component } from "react";
import { Button, Checkbox, DatePicker, Input, Select, TimePicker } from "antd";
import moment from "moment";
import docs from "./assets/image/docs.svg";
import trash from "./assets/image/trash.svg";
import back from "./assets/image/back.svg";
import add_icon from "./assets/image/add-icon.svg";
import MainPageLayout from "./components/MainPageLayout";
import { Link } from "react-router-dom";

export type UserScheduledPageState = {
    isChecked: boolean;
};
const { Option } = Select;
export default class UserScheduledPage extends Component<{}, UserScheduledPageState> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            isChecked: false,
        };
    }

    public render(): React.ReactNode {
        return (
            <MainPageLayout>
                <div className="user-schedule-box">
                    <div className="user-schedule-nav">
                        <div className="user-schedule-title">
                            <Link to={"/user/"}>
                                <div className="user-back">
                                    <img src={back} alt="back" />
                                    <span>返回</span>
                                </div>
                            </Link>
                            <div className="user-segmentation" />
                            <div className="user-title">预定房间</div>
                        </div>
                        <div className="user-schedule-cut-line" />
                    </div>
                    <div className="user-schedule-body">
                        <div className="user-schedule-mid">
                            <div className="user-schedule-name">主题</div>
                            <div className="user-schedule-inner">
                                <Input />
                            </div>
                            <div className="user-schedule-name">类型</div>
                            <div className="user-schedule-inner">
                                <Input />
                            </div>
                            <div className="user-schedule-name">开始时间</div>
                            <div className="user-schedule-inner">
                                <DatePicker className="user-schedule-picker" />
                                <TimePicker
                                    className="user-schedule-picker"
                                    defaultOpenValue={moment("00:00:00", "HH:mm:ss")}
                                />
                            </div>
                            <div className="user-schedule-name">结束时间</div>
                            <div className="user-schedule-inner">
                                <DatePicker className="user-schedule-picker" />
                                <TimePicker
                                    className="user-schedule-picker"
                                    defaultOpenValue={moment("00:00:00", "HH:mm:ss")}
                                />
                            </div>
                            <div className="user-schedule-inner">
                                <Checkbox onChange={this.handleCheckbox}>
                                    <span className="user-schedule-cycle">周期性房间</span>
                                </Checkbox>
                            </div>
                            {this.renderCycle()}
                            <div className="user-schedule-name">文档</div>
                            <div className="user-schedule-docs-list">
                                <div className="user-schedule-docs">
                                    <div className="user-schedule-docs-left">
                                        <img src={docs} alt={"docs"} />
                                        <span>《昆虫2》折纸图鉴.pptx (静态)</span>
                                    </div>
                                    <div className="user-schedule-docs-right">
                                        <img src={trash} alt={"trash"} />
                                    </div>
                                </div>
                                <div className="user-schedule-docs">
                                    <div className="user-schedule-docs-left">
                                        <img src={docs} alt={"docs"} />
                                        <span>光影静物.pptx (动态)</span>
                                    </div>
                                    <div className="user-schedule-docs-right">
                                        <img src={trash} alt={"trash"} />
                                    </div>
                                </div>
                                <div className="user-schedule-docs">
                                    <div className="user-schedule-docs-left">
                                        <img src={docs} alt={"docs"} />
                                        <span>look直播.pptx (静态)</span>
                                    </div>
                                    <div className="user-schedule-docs-right">
                                        <img src={trash} alt={"trash"} />
                                    </div>
                                </div>
                                <div className="user-schedule-docs">
                                    <div className="user-schedule-docs-left">
                                        <img src={docs} alt={"docs"} />
                                        <span>吴嘉楠的简历.pptx (动态)</span>
                                    </div>
                                    <div className="user-schedule-docs-right">
                                        <img src={trash} alt={"trash"} />
                                    </div>
                                </div>
                                <div className="user-schedule-docs">
                                    <div className="user-schedule-docs-left">
                                        <img src={docs} alt={"docs"} />
                                        <span>课件.pptx (静态)</span>
                                    </div>
                                    <div className="user-schedule-docs-right">
                                        <img src={trash} alt={"trash"} />
                                    </div>
                                </div>
                            </div>
                            <div className="user-schedule-inner">
                                <Button className="user-schedule-picker" type="dashed">
                                    <span>
                                        添加动态文档 <img src={add_icon} alt={"add_icon"} />
                                    </span>
                                </Button>
                                <Button className="user-schedule-picker" type="dashed">
                                    <span>
                                        添加静态文档 <img src={add_icon} alt={"add_icon"} />
                                    </span>
                                </Button>
                            </div>
                            <div className="user-schedule-under">
                                <Button className="user-schedule-cancel">取消</Button>
                                <Button className="user-schedule-ok">预定</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </MainPageLayout>
        );
    }

    private renderCycle = (): React.ReactNode => {
        const { isChecked } = this.state;

        if (!isChecked) {
            return null;
        }

        return (
            <>
                <div className="user-schedule-tips">
                    <div className="user-schedule-tips-title">每周一</div>
                    <div className="user-schedule-tips-type">房间类型：一对一</div>
                    <div className="user-schedule-tips-inner">
                        结束于 2020/11/30 周一，共 7 场会议
                    </div>
                </div>
                <div className="user-schedule-name">重复频率</div>
                <div className="user-schedule-inner">
                    <Input />
                </div>
                <div className="user-schedule-name">结束重复</div>
                <div className="user-schedule-inner">
                    <Select
                        mode="multiple"
                        allowClear
                        className="user-schedule-inner-select"
                        placeholder="Please select"
                    >
                        <Option value="china" label="China">
                            <div className="demo-option-label-item">China (中国)</div>
                        </Option>
                    </Select>
                </div>
            </>
        );
    };

    private handleCheckbox = (e: any): void => {
        this.setState({ isChecked: e.target.checked });
    };
}
