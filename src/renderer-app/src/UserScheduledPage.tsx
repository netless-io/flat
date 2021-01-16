import "./UserScheduledPage.less";
import React, { Component } from "react";
import { Button, Checkbox, DatePicker, Input, Select, TimePicker, InputNumber } from "antd";
// @TODO remove moment.js
import moment from "moment";
import docs from "./assets/image/docs.svg";
import trash from "./assets/image/trash.svg";
import back from "./assets/image/back.svg";
import add_icon from "./assets/image/add-icon.svg";
import MainPageLayout from "./components/MainPageLayout";
import { Link, RouteComponentProps } from "react-router-dom";
import { isBefore, addMinutes, addWeeks, format, roundToNearestMinutes, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";
import { DocsType, RoomType, Week } from "./apiMiddleware/flatServer/constants";
import { scheduleRoom } from "./apiMiddleware/flatServer";

enum PeriodicEndType {
    Rate = "Rate",
    Time = "Time",
}

const { Option } = Select;
export default class UserScheduledPage extends Component<
    UserScheduledPageProps,
    UserScheduledPageState
> {
    public constructor(props: UserScheduledPageProps) {
        super(props);
        this.state = {
            isPeriodic: false,
            title: "",
            type: RoomType.BigClass,
            beginTime: this.getInitialBeginTime(),
            endTime: this.getInitialEndTime(),
            periodicWeeks: [this.getInitialBeginWeek()],
            periodicEndType: PeriodicEndType.Rate,
            periodicRate: 1,
            periodicEndTime: this.getInitialEndTime(),
            docs: [],
        };
    }

    public getInitialBeginTime() {
        let time = roundToNearestMinutes(Date.now(), { nearestTo: 30 });
        if (isBefore(time, Date.now())) {
            time = addMinutes(time, 30);
        }
        return Number(time);
    }

    public getInitialBeginWeek() {
        const begin = this.getInitialBeginTime();
        return moment(begin).weekday();
    }

    public getInitialEndTime() {
        const begin = this.getInitialBeginTime();
        return Number(addMinutes(begin, 30));
    }

    public onChangeType = (type: RoomType) => {
        this.setState({ type });
    };

    public onChangeTitle = (title: string) => {
        this.setState({ title });
    };

    public onChangeBeginTime = (date: moment.Moment | null) => {
        if (date === null) {
            return null;
        }
        const week = date.weekday();
        this.setState({ periodicWeeks: [week] });
        return date && this.setState({ beginTime: date.valueOf(), endTime: date.valueOf() });
    };

    public onChangeEndTime = (date: moment.Moment | null) => {
        if (date === null) {
            return null;
        }
        return date && this.setState({ endTime: date.valueOf() });
    };

    public disabledDate = (beginTime: moment.Moment) => {
        return beginTime.isBefore(moment().startOf("day"));
    }

    // TODO disabledTime
    // private range(l: number, r: number) {
    //     return Array(r - l).fill(l).map((e, i) => e + i);
    // }

    public typeName = (type: RoomType) => {
        const typeNameMap: Record<RoomType, string> = {
            [RoomType.OneToOne]: "一对一",
            [RoomType.SmallClass]: "小班课",
            [RoomType.BigClass]: "大班课",
        };
        return typeNameMap[type];
    };

    public handleCheckbox = (e: any) => {
        this.setState({ isPeriodic: e.target.checked });
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
                                            <option key={e} value={e}>
                                                {this.typeName(e)}
                                            </option>
                                        );
                                    })}
                                </Select>
                            </div>
                            <div className="user-schedule-name">开始时间</div>
                            <div className="user-schedule-inner">
                                <DatePicker
                                    className="user-schedule-picker"
                                    disabledDate={this.disabledDate}
                                    value={moment(this.state.beginTime)}
                                    onChange={e => this.onChangeBeginTime(e)}
                                />
                                <TimePicker
                                    className="user-schedule-picker"
                                    value={moment(this.state.beginTime)}
                                    onChange={e => this.onChangeBeginTime(e)}
                                />
                            </div>
                            <div className="user-schedule-name">结束时间</div>
                            <div className="user-schedule-inner">
                                <DatePicker
                                    className="user-schedule-picker"
                                    disabledDate={this.disabledDate}
                                    value={moment(this.state.endTime)}
                                    onChange={e => this.onChangeEndTime(e)}
                                />
                                <TimePicker
                                    className="user-schedule-picker"
                                    value={moment(this.state.endTime)}
                                    onChange={e => this.onChangeEndTime(e)}
                                />
                            </div>
                            <div className="user-schedule-inner">
                                <Checkbox onChange={this.handleCheckbox}>
                                    <span className="user-schedule-cycle">周期性房间</span>
                                </Checkbox>
                            </div>
                            {this.renderPeriodic()}
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

    public scheduleRoom = async () => {
        const {
            title,
            type,
            beginTime,
            endTime,
            periodicWeeks: weeks,
            periodicEndType,
            periodicRate: rate,
            periodicEndTime: time,
        } = this.state;
        const requestBody: ScheduleRoomRequest = {
            title,
            type,
            beginTime,
            endTime,
            periodic: periodicEndType === "Rate" ? { weeks, rate } : { weeks, endTime: time },
        };
        // @TODO periodic can be null
        try {
            await scheduleRoom(requestBody);
            this.props.history.push("/user/");
        } catch (e) {
            // @TODO handle error
            console.error();
        }
    };

    // @TODO use date-fns locale
    public weekName(week: Week) {
        const weeknameMap: Record<Week, string> = {
            [Week.Sunday]: "周日",
            [Week.Monday]: "周一",
            [Week.Tuesday]: "周二",
            [Week.Wednesday]: "周三",
            [Week.Thursday]: "周四",
            [Week.Friday]: "周五",
            [Week.Saturday]: "周六",
        };
        return weeknameMap[week];
    }

    public renderWeeks(weeks: Week[]) {
        return weeks.map(this.weekName).join("、");
    }

    public periodicEndTypeName(type: PeriodicEndType) {
        const endTypeNameMap: Record<PeriodicEndType, string> = {
            Rate: "按次数",
            Time: "按时间",
        };
        return endTypeNameMap[type];
    }

    public periodicEndDate() {
        const { endTime, periodicEndType, periodicRate, periodicEndTime } = this.state;
        if (periodicEndType === "Rate") {
            return addWeeks(new Date(endTime), periodicRate);
        } else {
            return new Date(periodicEndTime);
        }
    }

    public renderPeriodicEndDate() {
        return format(this.periodicEndDate(), "yyyy/MM/dd iii", { locale: zhCN });
    }

    public onChangeWeeks = (e: Week[]) => {
        const { beginTime } = this.state;
        const week = moment(beginTime).weekday();
        if (!e.includes(week)) {
            e.push(week);
        }
        return this.setState({ periodicWeeks: e.sort() });
    };

    public calcRoomsTimes() {
        const {
            beginTime,
            periodicWeeks,
            periodicEndType,
            periodicRate,
            periodicEndTime,
        } = this.state;

        if (periodicEndType === "Rate") {
            return periodicRate;
        } else {
            let sum = 0;
            for (let t = beginTime; isBefore(t, periodicEndTime); t = Number(addDays(t, 1))) {
                if (periodicWeeks.includes(new Date(t).getDay())) {
                    sum++;
                }
            }
            return sum;
        }
    }

    public renderPeriodic = (): React.ReactNode => {
        const {
            isPeriodic,
            periodicWeeks: weeks,
            type,
            periodicEndType: endType,
            periodicRate: endRate,
            periodicEndTime: endTime,
        } = this.state;

        if (!isPeriodic) {
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
                        结束于 {this.renderPeriodicEndDate()}，共 {this.calcRoomsTimes()} 个房间
                    </div>
                </div>
                <div className="user-schedule-name">重复频率</div>
                <div className="user-schedule-inner">
                    <Select
                        mode="multiple"
                        allowClear
                        className="user-schedule-inner-select"
                        value={weeks}
                        onChange={this.onChangeWeeks}
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
                            this.setState({ periodicEndType: e });
                        }}
                    >
                        {(["Rate", "Time"] as PeriodicEndType[]).map(e => {
                            return (
                                <Option key={e} value={e} label={this.periodicEndTypeName(e)}>
                                    <div className="option-label-item">
                                        {this.periodicEndTypeName(e)}
                                    </div>
                                </Option>
                            );
                        })}
                    </Select>
                    {endType === "Rate" ? (
                        <InputNumber
                            className="user-schedule-picker option-label-item"
                            min={1}
                            value={endRate}
                            onChange={e => e && this.setState({ periodicRate: Number(e) })}
                        />
                    ) : (
                        <DatePicker
                            className="user-schedule-picker"
                            format="YYYY-MM-DD"
                            allowClear={false}
                            value={moment(endTime)}
                            onChange={e => e && this.setState({ periodicEndTime: e.valueOf() })}
                        />
                    )}
                </div>
            </>
        );
    };
}

export type UserScheduledPageProps = RouteComponentProps<{}>;

type ScheduleRoomRequest = {
    title: string;
    type: RoomType;
    beginTime: number;
    endTime: number;
    periodic: { weeks: Week[] } & ({ rate: number } | { endTime: number });
    docs?: { type: DocsType; uuid: string }[];
};

export type UserScheduledPageState = {
    isPeriodic: boolean;
    /** 房间主题, 最多 50 字 */
    title: string;
    /** 上课类型 */
    type: RoomType;
    /** UTC开始时间戳 */
    beginTime: number;
    /** UTC结束时间戳 */
    endTime: number;
    /** 重复周期, 每周的周几 */
    periodicWeeks: Week[];
    /** 结束重复类型 */
    periodicEndType: PeriodicEndType;
    /** 重复几次就结束, -1..50 */
    periodicRate: number;
    /** UTC时间戳, 到这个点就结束 */
    periodicEndTime: number;
    /** 课件 */
    docs: { type: DocsType; uuid: string }[];
};
