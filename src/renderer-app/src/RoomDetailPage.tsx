import React, { PureComponent } from "react";
import { Button, Input, Modal } from "antd";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Link, RouteComponentProps } from "react-router-dom";
import MainPageLayout from "./components/MainPageLayout";
import { RoomStatus, RoomType } from "./apiMiddleware/flatServer/constants";
import {
    ordinaryRoomInfo,
    periodicSubRoomInfo,
    cancelPeriodicRoom,
    cancelOrdinaryRoom,
    OrdinaryRoomInfoResult,
    PeriodicSubRoomInfoResult,
    periodicRoomInfo,
    PeriodicRoomInfoResult,
} from "./apiMiddleware/flatServer";
import { Identity } from "./utils/localStorage/room";
import { getUserUuid } from "./utils/localStorage/accounts";
import { roomStore } from "./stores/RoomStore";

import back from "./assets/image/back.svg";
import home_icon_gray from "./assets/image/home-icon-gray.svg";
import room_type from "./assets/image/room-type.svg";
import docs_icon from "./assets/image/docs-icon.svg";
import "./RoomDetailPage.less";

export type RoomDetailPageState = {
    isTeacher: boolean;
    rate: number | null;
    roomInfo: {
        title: string;
        beginTime: Date;
        endTime: Date;
        roomType: RoomType;
        roomStatus: RoomStatus;
        ownerUUID: string;
    };
    roomUUID: string;
    periodicUUID: string;
    userUUID: string;
    isPeriodic: boolean;
    toggleCopyModal: boolean;
};

export type RoomDetailPageProps = RouteComponentProps<{ uuid: string }> & {
    uuid: string;
};

export default class RoomDetailPage extends PureComponent<
    RoomDetailPageProps,
    RoomDetailPageState
> {
    private roomStatusLocale = {
        [RoomStatus.Idle]: "未开始",
        [RoomStatus.Started]: "进行中",
        [RoomStatus.Paused]: "已暂停",
        [RoomStatus.Stopped]: "已停止",
    };

    public constructor(props: RoomDetailPageProps) {
        super(props);
        this.state = {
            isTeacher: true,
            rate: 0,
            roomInfo: {
                title: "",
                beginTime: new Date(),
                endTime: new Date(),
                roomStatus: RoomStatus.Idle,
                roomType: RoomType.BigClass,
                ownerUUID: "",
            },
            roomUUID: "",
            periodicUUID: "",
            userUUID: "",
            isPeriodic: false,
            toggleCopyModal: false,
        };
    }

    public async componentDidMount(): Promise<void> {
        const { roomUUID, periodicUUID, userUUID } = this.props.location
            .state as RoomDetailPageState;
        let res: PeriodicSubRoomInfoResult | OrdinaryRoomInfoResult;
        let getRate: PeriodicRoomInfoResult;
        if (periodicUUID) {
            res = await periodicSubRoomInfo({ roomUUID, periodicUUID });
            getRate = await periodicRoomInfo(periodicUUID);
            this.setState({ isPeriodic: true, rate: getRate.periodic.rate });
        } else {
            res = await ordinaryRoomInfo(roomUUID);
        }
        this.setState({
            roomInfo: {
                title: res.roomInfo.title,
                beginTime: new Date(res.roomInfo.beginTime),
                endTime: new Date(res.roomInfo.endTime),
                ownerUUID: res.roomInfo.ownerUUID,
                roomStatus: res.roomInfo.roomStatus,
                roomType: res.roomInfo.roomType,
            },
            roomUUID,
            periodicUUID,
            userUUID,
        });
    }

    public roomType = (type: RoomType): string => {
        const typeNameMap: Record<RoomType, string> = {
            [RoomType.OneToOne]: "一对一",
            [RoomType.SmallClass]: "小班课",
            [RoomType.BigClass]: "大班课",
        };
        return typeNameMap[type];
    };

    public formatDate = (date: Date): string => {
        return format(date, "yyyy/MM/dd", { locale: zhCN });
    };

    public formatTime = (time: Date): string => {
        return format(time, "HH:mm");
    };

    public getIdentity = (): string => {
        return getUserUuid() === this.state.userUUID ? Identity.creator : Identity.joiner;
    };

    public joinRoom = async (): Promise<void> => {
        const data = await roomStore.joinRoom(this.state.roomUUID);
        const url = `/classroom/${data.roomType}/${data.roomUUID}/${data.ownerUUID}/`;
        this.props.history.push(url);
    };

    public cancelRoom = async (): Promise<void> => {
        const { periodicUUID, roomUUID } = this.state;
        if (periodicUUID) {
            await cancelPeriodicRoom(periodicUUID);
        } else {
            await cancelOrdinaryRoom(roomUUID);
        }
        this.props.history.push("/user/");
    };

    public showCopyModal = (): void => {
        this.setState({ toggleCopyModal: true });
    };

    public handleCancel = (): void => {
        this.setState({ toggleCopyModal: false });
    };

    public renderModal = (): React.ReactNode => {
        const { roomUUID } = this.state;
        const { title } = this.state.roomInfo;
        // TODO  Data Rendering Modal
        return (
            <Modal
                width={460}
                visible={this.state.toggleCopyModal}
                onCancel={this.handleCancel}
                okText="复制"
                cancelText="取消"
            >
                <div className="modal-header">
                    <div>邀请加入 FLAT 房间</div>
                    <span>点击链接加入，或添加至房间列表</span>
                </div>
                <div className="modal-content">
                    <div className="modal-content-left">
                        <span>房间主题</span>
                        <span>房间号</span>
                        <span>开始时间</span>
                    </div>
                    <div className="modal-content-right">
                        <div>{title}</div>
                        <div>{roomUUID}</div>
                        <div>2020/11/21 11:21~11~22</div>
                    </div>
                </div>
                <Input type="text" placeholder="https://netless.link/url/5f2259d5069bc052d2" />
            </Modal>
        );
    };

    private renderButton = (): React.ReactNode => {
        const { isTeacher } = this.state;
        if (isTeacher) {
            return (
                <div className="user-room-btn-box">
                    <Button className="user-room-btn" danger onClick={this.cancelRoom}>
                        取消房间
                    </Button>
                    <Button className="user-room-btn">修改房间</Button>
                    <Button className="user-room-btn" onClick={this.showCopyModal}>
                        邀请加入
                    </Button>
                    {this.renderModal()}
                    <Button className="user-room-btn" type="primary" onClick={this.joinRoom}>
                        进入房间
                    </Button>
                </div>
            );
        } else {
            return (
                <div className="user-room-btn-box">
                    <Button className="user-room-btn" danger>
                        删除房间
                    </Button>
                    <Button className="user-room-btn" onClick={this.showCopyModal}>
                        邀请加入
                    </Button>
                    <Button type="primary" className="user-room-btn" onClick={this.joinRoom}>
                        进入房间
                    </Button>
                </div>
            );
        }
    };

    public render(): React.ReactNode {
        const { roomUUID, rate, periodicUUID, userUUID } = this.state;
        const { title, beginTime, endTime, roomStatus, roomType } = this.state.roomInfo;
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
                            <div className="user-title">{title}</div>
                            {this.state.isPeriodic ? (
                                <div className="user-periodic">周期</div>
                            ) : null}
                            {this.state.isPeriodic ? (
                                <div className="user-periodic-room">
                                    {rate ? (
                                        <Link
                                            to={{
                                                pathname: "/user/scheduled/info/",
                                                state: { periodicUUID, roomUUID, userUUID, title },
                                            }}
                                        >
                                            查看全部 {rate} 场房间
                                        </Link>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                        <div className="user-schedule-cut-line" />
                    </div>
                    <div className="user-schedule-body">
                        <div className="user-schedule-mid">
                            <div className="user-room-time">
                                <div className="user-room-time-box">
                                    <div className="user-room-time-number">
                                        {this.formatTime(beginTime)}
                                    </div>
                                    <div className="user-room-time-date">
                                        {this.formatDate(beginTime)}
                                    </div>
                                </div>
                                <div className="user-room-time-mid">
                                    <div className="user-room-time-during">1 小时</div>
                                    <div className="user-room-time-state">
                                        {this.roomStatusLocale[roomStatus]}
                                    </div>
                                </div>
                                <div className="user-room-txime-box">
                                    <div className="user-room-time-number">
                                        {this.formatTime(endTime)}
                                    </div>
                                    <div className="user-room-time-date">
                                        {this.formatDate(endTime)}
                                    </div>
                                </div>
                            </div>
                            <div className="user-room-cut-line" />
                            <div className="user-room-detail">
                                <div className="user-room-inf">
                                    <div className="user-room-docs-title">
                                        <img src={home_icon_gray} alt={"home_icon_gray"} />
                                        <span>房间号</span>
                                    </div>
                                    <div className="user-room-docs-right">{roomUUID}</div>
                                </div>
                                <div className="user-room-inf">
                                    <div className="user-room-docs-title">
                                        <img src={room_type} alt={"room_type"} />
                                        <span>房间类型</span>
                                    </div>
                                    <div className="user-room-docs-right">
                                        {this.roomType(roomType)}
                                    </div>
                                </div>
                                <div className="user-room-docs">
                                    <div className="user-room-docs-title">
                                        <img src={docs_icon} alt={"docs_icon"} />
                                        <span>课件.xxx (动态)</span>
                                    </div>
                                    <div className="user-room-docs-set">缓存</div>
                                </div>
                                <div className="user-room-docs">
                                    <div className="user-room-docs-title">
                                        <img src={docs_icon} alt={"docs_icon"} />
                                        <span>课件.xxx (动态)</span>
                                    </div>
                                    <div className="user-room-docs-set">缓存</div>
                                </div>
                            </div>
                            {this.renderButton()}
                        </div>
                    </div>
                </div>
            </MainPageLayout>
        );
    }
}
