import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Button, DatePicker, Input, Select, TimePicker } from "antd";
import back from "../../assets/image/back.svg";
import MainPageLayout from "../../components/MainPageLayout";
import { RoomType } from "../../apiMiddleware/flatServer/constants";
import { addMinutes, isBefore, roundToNearestMinutes } from "date-fns";
import moment from "moment";
import {
    periodicRoomInfo,
    modifyOrdinary,
    ModifyOrdinaryPayload,
    ordinaryRoomInfo,
} from "../../apiMiddleware/flatServer";

type ModifyOrdinaryRoomPageProps = RouteComponentProps & {
    title: string;
    roomType: RoomType;
    beginTime: number;
    endTime: number;
    headerValue: string;
    roomUUID: string;
    periodicUUID: string;
};

type ModifyOrdinaryRoomPageState = {
    beginTime: number;
    endTime: number;
    type: RoomType;
    title: string;
    roomUUID: string;
    periodicUUID: string;
};

export default class ModifyOrdinaryRoomPage extends React.Component<
    ModifyOrdinaryRoomPageProps,
    ModifyOrdinaryRoomPageState
> {
    public constructor(props: ModifyOrdinaryRoomPageProps) {
        super(props);
        const { beginTime, endTime, title, roomUUID, periodicUUID } = this.props.location
            .state as ModifyOrdinaryRoomPageProps;
        this.state = {
            type: RoomType.BigClass,
            beginTime: beginTime,
            endTime: endTime,
            title: title,
            roomUUID: roomUUID,
            periodicUUID: periodicUUID,
        };
    }

    public async componentDidMount() {
        const { periodicUUID, roomUUID } = this.state;
        await this.getRoomInfo(periodicUUID, roomUUID);
    }

    public getRoomInfo = async (periodicUUID: string, roomUUID: string) => {
        // const { periodicUUID, roomUUID } = this.state;
        let roomInfoData;
        if (periodicUUID) {
            roomInfoData = await periodicRoomInfo(periodicUUID);
            this.setState({});
        } else {
            roomInfoData = await ordinaryRoomInfo(roomUUID);
            this.setState({});
        }
    };

    public getInitialBeginTime() {
        let time = roundToNearestMinutes(Date.now(), { nearestTo: 30 });
        if (isBefore(time, Date.now())) {
            time = addMinutes(time, 30);
        }
        return Number(time);
    }

    public getInitialBeginWeek(): number {
        const begin = this.getInitialBeginTime();
        return moment(begin).weekday();
    }

    public getInitialEndTime(): number {
        const begin = this.getInitialBeginTime();
        return Number(addMinutes(begin, 30));
    }

    public onChangeType = (type: RoomType): void => {
        this.setState({ type });
    };

    public onChangeTitle = (title: string): void => {
        this.setState({ title });
    };

    public onChangeBeginTime = (date: moment.Moment | null): void | null => {
        if (date === null) {
            return null;
        }
        // const week = date.weekday();
        // this.setState({ periodicWeeks: [week] });
        return date && this.setState({ beginTime: date.valueOf(), endTime: date.valueOf() });
    };

    public onChangeEndTime = (date: moment.Moment | null): void | null => {
        if (date === null) {
            return null;
        }
        return date && this.setState({ endTime: date.valueOf() });
    };

    public disabledDate = (beginTime: moment.Moment): boolean => {
        return beginTime.isBefore(moment().startOf("day"));
    };

    // TODO disabledTime
    // private range(l: number, r: number) {
    //     return Array(r - l).fill(l).map((e, i) => e + i);
    // }

    public typeName = (type: RoomType): string => {
        const typeNameMap: Record<RoomType, string> = {
            [RoomType.OneToOne]: "一对一",
            [RoomType.SmallClass]: "小班课",
            [RoomType.BigClass]: "大班课",
        };
        return typeNameMap[type];
    };

    // public handleCheckbox = (e: any) => {
    //     this.setState({ isPeriodic: e.target.checked });
    // };

    public render(): React.ReactNode {
        const { title, beginTime, endTime } = this.state;
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
                            <div className="user-title">修改房间</div>
                        </div>
                        <div className="user-schedule-cut-line" />
                    </div>
                    <div className="user-schedule-body">
                        <div className="user-schedule-mid">
                            <div className="user-schedule-name">主题</div>
                            <div className="user-schedule-inner">
                                <Input
                                    value={title}
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
                                    value={moment(beginTime)}
                                    onChange={e => this.onChangeBeginTime(e)}
                                />
                                <TimePicker
                                    className="user-schedule-picker"
                                    value={moment(beginTime)}
                                    onChange={e => this.onChangeBeginTime(e)}
                                />
                            </div>
                            <div className="user-schedule-name">结束时间</div>
                            <div className="user-schedule-inner">
                                <DatePicker
                                    className="user-schedule-picker"
                                    disabledDate={this.disabledDate}
                                    value={moment(endTime)}
                                    onChange={e => this.onChangeEndTime(e)}
                                />
                                <TimePicker
                                    className="user-schedule-picker"
                                    value={moment(endTime)}
                                    onChange={e => this.onChangeEndTime(e)}
                                />
                            </div>
                            {/* <div className="user-schedule-inner">
                                <Checkbox onChange={this.handleCheckbox}>
                                    <span className="user-schedule-cycle">周期性房间</span>
                                </Checkbox>
                            </div>
                            {this.renderPeriodic()} */}
                            <div className="user-schedule-under">
                                <Button className="user-schedule-cancel">取消</Button>
                                <Button className="user-schedule-ok" onClick={this.modifyOrdinary}>
                                    确定
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </MainPageLayout>
        );
    }

    public modifyOrdinary = async (): Promise<void> => {
        const { title, type, beginTime, endTime, roomUUID } = this.state;
        const requestBody: ModifyOrdinaryPayload = {
            title,
            roomUUID,
            type,
            beginTime,
            endTime,
        };
        try {
            await modifyOrdinary(requestBody);
            this.props.history.push("/user/");
        } catch (error) {
            console.error();
        }
    };
}
