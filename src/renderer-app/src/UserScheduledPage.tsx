import { Button, Checkbox, DatePicker, Input, Select, TimePicker } from "antd";
import moment from "moment";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import add_icon from "./assets/image/add-icon.svg";
import back from "./assets/image/back.svg";
import docs from "./assets/image/docs.svg";
import trash from "./assets/image/trash.svg";
import MainPageLayout from "./components/MainPageLayout";
import "./UserScheduledPage.less";

enum RoomType {
    OneToOne,
    SmallClass,
    BigClass,
}

enum Week {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

enum DocsType {
    Dynamic = "Dynamic",
    Static = "Static",
}

// 预订房间请求类型
type BookRoomRequest = {
    title: string;
    type: RoomType;
    beginTime: number;
    endTime: number;
    cyclical?:
        | {
              weeks: Week[];
              rate: number;
          }
        | {
              weeks: Week[];
              endTime: number;
          };
    docs?: {
        type: DocsType;
        uuid: string;
    }[];
};

export type UserScheduledPageState = {
    /** 是否周期性房间 */
    isCycle: boolean;
    /** 主题 */
    title: string;
    /** 类型 */
    type: RoomType;
    /** 开始时间 */
    beginTime: number;
    /** 结束时间 */
    endTime: number;
    /** 重复频率 (后端接口只能选择每周的某一天) */
    cyclicalWeek?: Week;
    /** 结束重复 */
    cyclicalEndTime?: number;
    /** TODO: 文档 */
    docs: { type: DocsType; uuid: string }[];
};

const { Option } = Select;

export default class UserScheduledPage extends Component<{}, UserScheduledPageState> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            isCycle: false,
            title: "",
            type: RoomType.BigClass,
            beginTime: +new Date(),
            endTime: +new Date(),
            docs: [],
        };
    }

    public onChangeTitle = (title: string) => {
        this.setState({ title });
    };

    public onChangeType = (type: RoomType) => {
        this.setState({ type });
    };

    public onBeginTimeChange = (date: moment.Moment) => {
        this.setState({ beginTime: date.valueOf() });
    };
    public onEndTimeChange = (date: moment.Moment) => {
        this.setState({ endTime: date.valueOf() });
    };

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
                                <Input
                                    value={this.state.title}
                                    onChange={e => this.onChangeTitle(e.target.value)}
                                />
                            </div>
                            <div className="user-schedule-name">类型</div>
                            <div className="user-schedule-inner">
                                <Select
                                    className="user-schedule-inner-select"
                                    value={this.state.type}
                                    onChange={e => this.onChangeType(e)}
                                >
                                    <Option value={RoomType.BigClass}>大班课</Option>
                                    <Option value={RoomType.SmallClass}>小班课</Option>
                                    <Option value={RoomType.OneToOne}>一对一</Option>
                                </Select>
                            </div>
                            <div className="user-schedule-name">开始时间</div>
                            <div className="user-schedule-inner">
                                <DatePicker
                                    className="user-schedule-picker"
                                    value={moment(this.state.beginTime)}
                                    onChange={e => this.onBeginTimeChange(e!)}
                                />
                                <TimePicker
                                    className="user-schedule-picker"
                                    value={moment(this.state.beginTime)}
                                    onChange={e => this.onBeginTimeChange(e!)}
                                />
                            </div>
                            <div className="user-schedule-name">结束时间</div>
                            <div className="user-schedule-inner">
                                <DatePicker
                                    className="user-schedule-picker"
                                    value={moment(this.state.endTime)}
                                    onChange={e => this.onEndTimeChange(e!)}
                                />
                                <TimePicker
                                    className="user-schedule-picker"
                                    value={moment(this.state.endTime)}
                                    onChange={e => this.onEndTimeChange(e!)}
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
        const { isCycle: isChecked } = this.state;

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
        this.setState({ isCycle: e.target.checked });
    };
}
