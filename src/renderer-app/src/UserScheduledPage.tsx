import { Button, Checkbox, DatePicker, Input, InputNumber, Select, TimePicker } from "antd";
import { isBefore, roundToNearestMinutes } from "date-fns";
import { addMinutes } from "date-fns/esm";
import moment from "moment";
import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import add_icon from "./assets/image/add-icon.svg";
import back from "./assets/image/back.svg";
import docs from "./assets/image/docs.svg";
import trash from "./assets/image/trash.svg";
import MainPageLayout from "./components/MainPageLayout";
import { Status } from "./components/WeChatLogin";
import { FLAT_SERVER_ROOM } from "./constants/FlatServer";
import "./UserScheduledPage.less";
import { fetcher } from "./utils/fetcher";

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
type ScheduleRoomRequest = {
    title: string;
    type: RoomType;
    beginTime: number;
    endTime: number;
    cyclical: { weeks: Week[] } & ({ rate: number } | { endTime: number });
    docs?: { type: DocsType; uuid: string }[];
};

type CyclicalEndType = "rate" | "time";

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
    /** 重复频率 */
    cyclicalWeeks: Week[];
    /** 结束重复类型 */
    cyclicalEndType: CyclicalEndType;
    /** 结束重复：按次数 */
    cyclicalEndRate: number;
    /** 结束重复：按时间 */
    cyclicalEndTime: number;
    /** TODO: 文档 */
    docs: { type: DocsType; uuid: string }[];
};

const { Option } = Select;

export default class UserScheduledPage extends Component<
    RouteComponentProps<{}>,
    UserScheduledPageState
> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        this.state = {
            isCycle: false,
            title: "",
            type: RoomType.BigClass,
            beginTime: this.getInitialBeginTime(),
            endTime: this.getInitialEndTime(),
            docs: [],
            cyclicalWeeks: [Week.Monday],
            cyclicalEndType: "rate",
            cyclicalEndRate: 1,
            cyclicalEndTime: this.getInitialEndTime(),
        };
    }

    private getInitialBeginTime() {
        const now = new Date();
        let ret = roundToNearestMinutes(now, { nearestTo: 30 });
        if (isBefore(ret, now)) ret = addMinutes(ret, 30);
        return Number(ret);
    }

    private getInitialEndTime() {
        const begin = this.getInitialBeginTime();
        return Number(addMinutes(begin, 30));
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

    private typeName = (type: RoomType) => {
        const typeNameMap: Record<RoomType, string> = {
            [RoomType.OneToOne]: "一对一",
            [RoomType.SmallClass]: "小班课",
            [RoomType.BigClass]: "大班课",
        };
        return typeNameMap[type];
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
                                    {[
                                        RoomType.OneToOne,
                                        RoomType.SmallClass,
                                        RoomType.BigClass,
                                    ].map(e => {
                                        return (
                                            <Option key={e} value={e}>
                                                {this.typeName(e)}
                                            </Option>
                                        );
                                    })}
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
                                <Button className="user-schedule-ok" onClick={this.scheduleRoom}>
                                    预定
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </MainPageLayout>
        );
    }

    private scheduleRoom = async () => {
        const {
            title,
            type,
            beginTime,
            endTime,
            cyclicalWeeks: weeks,
            cyclicalEndType,
            cyclicalEndRate: rate,
            cyclicalEndTime: time,
        } = this.state;
        const requestBody: ScheduleRoomRequest = {
            title,
            type,
            beginTime,
            endTime,
            cyclical: cyclicalEndType === "rate" ? { weeks, rate } : { weeks, endTime: time },
        };
        // TODO cyclical can be null
        const { data: res } = await fetcher.post(FLAT_SERVER_ROOM.SCHEDULE, requestBody);
        if (res.status === Status.Success) {
            this.props.history.push("/user/");
        }
    };

    private weekName = (week: Week) => {
        const weekNameMap: Record<Week, string> = {
            [Week.Sunday]: "周日",
            [Week.Monday]: "周一",
            [Week.Tuesday]: "周二",
            [Week.Wednesday]: "周三",
            [Week.Thursday]: "周四",
            [Week.Friday]: "周五",
            [Week.Saturday]: "周六",
        };
        return weekNameMap[week];
    };

    private renderWeeks(weeks: Week[]) {
        return weeks.map(this.weekName).join("、");
    }

    private cyclicalEndTypeName(type: CyclicalEndType) {
        const endTypeNameMap: Record<CyclicalEndType, string> = {
            rate: "按次数",
            time: "按时间",
        };
        return endTypeNameMap[type];
    }

    private renderCycle = (): React.ReactNode => {
        const {
            isCycle: isChecked,
            cyclicalWeeks: weeks,
            type,
            cyclicalEndType: endType,
            cyclicalEndRate: endRate,
            cyclicalEndTime: endTime,
        } = this.state;

        if (!isChecked) {
            return null;
        }

        return (
            <>
                <div className="user-schedule-tips">
                    {weeks.length > 0 ? (
                        <div className="user-schedule-tips-title">每{this.renderWeeks(weeks)}</div>
                    ) : (
                        <div>暂未选择频率</div>
                    )}
                    <div className="user-schedule-tips-type">房间类型：{this.typeName(type)}</div>
                    <div className="user-schedule-tips-inner">
                        结束于 2020/11/30 周一，共 7 场会议
                    </div>
                </div>
                <div className="user-schedule-name">重复频率</div>
                <div className="user-schedule-inner">
                    <Select
                        mode="multiple"
                        allowClear
                        className="user-schedule-inner-select"
                        value={weeks}
                        onChange={w => this.setState({ cyclicalWeeks: w.sort() })}
                    >
                        {[
                            Week.Sunday,
                            Week.Monday,
                            Week.Tuesday,
                            Week.Wednesday,
                            Week.Thursday,
                            Week.Friday,
                            Week.Saturday,
                        ].map(e => {
                            return (
                                <Option key={e} value={e} label={this.weekName(e)}>
                                    <div className="demo-option-label-item">{this.weekName(e)}</div>
                                </Option>
                            );
                        })}
                    </Select>
                </div>
                <div className="user-schedule-name">结束重复</div>
                <div className="user-schedule-inner">
                    <Select
                        className="user-schedule-picker"
                        value={endType}
                        onChange={e => {
                            this.setState({ cyclicalEndType: e });
                        }}
                    >
                        {(["rate", "time"] as CyclicalEndType[]).map(e => {
                            return (
                                <Option key={e} value={e} label={this.cyclicalEndTypeName(e)}>
                                    <div className="demo-option-label-item">
                                        {this.cyclicalEndTypeName(e)}
                                    </div>
                                </Option>
                            );
                        })}
                    </Select>
                    {endType === "rate" ? (
                        <InputNumber
                            className="user-schedule-picker demo-option-label-item"
                            min={1}
                            value={endRate}
                            onChange={e => this.setState({ cyclicalEndRate: Number(e) })}
                        />
                    ) : (
                        <DatePicker
                            className="user-schedule-picker"
                            format="YYYY-MM-DD HH:mm:ss"
                            showTime
                            value={moment(endTime)}
                            onChange={e => this.setState({ cyclicalEndTime: e!.valueOf() })}
                        />
                    )}
                </div>
            </>
        );
    };

    private handleCheckbox = (e: any): void => {
        this.setState({ isCycle: e.target.checked });
    };
}
