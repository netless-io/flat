import React from "react";
import { RoomStatus, RoomType, Week } from "../../apiMiddleware/flatServer/constants";
import { RouteComponentProps } from "react-router";
import MainPageLayout from "../../components/MainPageLayout";
import { Link } from "react-router-dom";
import _ from "lodash";
import back from "../../assets/image/back.svg";
import moreBtn from "../../assets/image/moreBtn.svg";
import {
    cancelPeriodicRoom,
    periodicRoomInfo,
    PeriodicRoomInfoPayload,
    PeriodicRoomInfoResult,
} from "../../apiMiddleware/flatServer";
import "./ScheduleRoomPage.less";
import { Button, Dropdown, Input, Menu, Modal, Table } from "antd";
import { format, getDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import memoizeOne from "memoize-one";
import { generateRoutePath, RouteNameType } from "../../utils/routes";

export default class ScheduleRoomDetailPage extends React.Component<
    RouteComponentProps,
    ScheduleRoomDetailPageState
> {
    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            periodic: {
                ownerUUID: "",
                endTime: Date.now(),
                rate: 0,
                roomType: RoomType.OneToOne,
            },
            rooms: [],
            currentRoom: {
                roomUUID: "",
                beginTime: Date.now(),
                endTime: Date.now(),
                roomStatus: RoomStatus.Idle,
            },
            sortedRooms: [],
            toggleCopyModal: false,
        };
    }

    public async componentDidMount(): Promise<void> {
        const { periodicUUID } = this.props.location.state as ScheduleRoomProps;
        let res: PeriodicRoomInfoPayload | PeriodicRoomInfoResult;
        res = await periodicRoomInfo(periodicUUID);
        this.setState({
            periodic: res.periodic,
            rooms: res.rooms,
            sortedRooms: res.rooms.map(room => {
                return {
                    yearMonth: this.formatMonth(new Date(room.beginTime)),
                    day: this.formatDay(new Date(room.beginTime)) + "日",
                    week: this.weekName(this.formatWeek(new Date(room.beginTime))),
                    time: this.formatTime(room),
                    roomStatus: room.roomStatus,
                    room,
                };
            }),
        });
    }

    public roomStatusName(status: RoomStatus): string {
        const statusNameMap: Record<RoomStatus, string> = {
            [RoomStatus.Idle]: "未开始",
            [RoomStatus.Started]: "进行中",
            [RoomStatus.Paused]: "已暂停",
            [RoomStatus.Stopped]: "已停止",
        };
        return statusNameMap[status];
    }

    public weekName(week: Week): string {
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
    }

    public formatWeek = (time: number | Date): number => {
        return getDay(time);
    };

    public formatEndTime = (): string => {
        const { endTime } = this.state.periodic;
        return format(new Date(endTime), "yyyy/MM/dd iii", { locale: zhCN });
    };

    public formatTime = (room: { beginTime: number; endTime: number }): string => {
        return (
            format(new Date(room.beginTime), "HH:mm") +
            "~" +
            format(new Date(room.endTime), "HH:mm")
        );
    };

    public formatMonth = (time: Date): string => {
        return format(time, "yyyy/MM", { locale: zhCN });
    };

    public formatDay = (time: Date): string => {
        return format(time, "dd", { locale: zhCN });
    };

    public generatGroupRooms = memoizeOne(
        (sortedArry: SortedRoom[], sortedString: string): _.Dictionary<SortedRoom[]> => {
            return _.groupBy(sortedArry, sortedString);
        },
    );

    public renderRoomTable(): React.ReactNode {
        const { sortedRooms: sortedRoom } = this.state;
        const columns = [
            {
                dataIndex: "day",
            },
            {
                dataIndex: "week",
            },
            {
                dataIndex: "time",
            },
            {
                dataIndex: "roomStatus",
                render: this.renderRoomStatus,
            },
            {
                dataIndex: "room",
                render: this.renderMoreBtn,
            },
        ];

        const groupedRooms = this.generatGroupRooms(sortedRoom, "yearMonth");
        const sortedKeys = _.keys(groupedRooms).sort();
        const groupedSortedRooms = sortedKeys.map(yearMonth => ({
            yearMonth,
            rooms: groupedRooms[yearMonth],
        }));
        const groupedList = groupedSortedRooms.map(room => {
            return (
                <div>
                    <div className="month-value">{room.yearMonth}</div>
                    <div className="table-line"></div>
                    <Table
                        dataSource={room.rooms}
                        columns={columns}
                        showHeader={false}
                        bordered={false}
                        pagination={false}
                    />
                </div>
            );
        });
        return <div className="table-container">{groupedList}</div>;
    }

    public renderMoreBtn = (room: Room): React.ReactNode => {
        return (
            <Dropdown overlay={this.renderMenu(room)} trigger={["click"]}>
                <img src={moreBtn} alt="更多" />
            </Dropdown>
        );
    };

    public renderRoomStatus = (roomStatus: RoomStatus): React.ReactNode => {
        if (roomStatus === RoomStatus.Idle) {
            return <span className="room-idle">未开始</span>;
        } else if (roomStatus === RoomStatus.Started) {
            return <span className="room-started">进行中</span>;
        } else if (roomStatus === RoomStatus.Paused) {
            return <span className="room-paused">已暂停</span>;
        } else if (roomStatus === RoomStatus.Stopped) {
            return <span className="room-stopped">已结束</span>;
        } else {
            return null;
        }
    };

    public showCopyModal = (room: Room): void => {
        this.setState({
            currentRoom: room,
            toggleCopyModal: true,
        });
    };

    public handleCancel = (): void => {
        this.setState({ toggleCopyModal: false });
    };

    public renderModal = (): React.ReactNode => {
        const { periodicUUID, title } = this.props.location.state as ScheduleRoomProps;
        const { currentRoom } = this.state;
        return (
            <Modal
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
                        <div>{periodicUUID}</div>
                        <div>
                            {this.formatEndTime()} {this.formatTime(currentRoom!)}
                        </div>
                    </div>
                </div>
                <Input type="text" placeholder="https://netless.link/url/5f2259d5069bc052d2" />
            </Modal>
        );
    };

    public renderMenu = (room: Room): JSX.Element => {
        const { periodicUUID, roomUUID } = this.props.location.state as ScheduleRoomProps;
        return (
            <Menu>
                <Menu.Item>
                    <Link
                        to={{
                            pathname: generateRoutePath(RouteNameType.RoomDetailPage, {
                                roomUUID,
                                periodicUUID,
                            }),
                        }}
                    >
                        房间详情
                    </Link>
                </Menu.Item>
                <Menu.Item>修改房间</Menu.Item>
                <Menu.Item>取消房间</Menu.Item>
                <Menu.Item onClick={() => this.showCopyModal(room)}>复制邀请</Menu.Item>
                {this.renderModal()}
            </Menu>
        );
    };

    public cancelRoom = async (): Promise<void> => {
        const { periodicUUID } = this.props.location.state as ScheduleRoomProps;
        await cancelPeriodicRoom(periodicUUID);
        this.props.history.push("/user/");
    };

    public render(): JSX.Element {
        const { periodicUUID, roomUUID, title } = this.props.location.state as ScheduleRoomProps;
        const { roomType, rate } = this.state.periodic;
        return (
            <MainPageLayout>
                <div className="user-schedule-box">
                    <div className="user-schedule-nav">
                        <div className="user-schedule-title">
                            <Link
                                to={{
                                    pathname: generateRoutePath(RouteNameType.RoomDetailPage, {
                                        roomUUID,
                                        periodicUUID,
                                    }),
                                }}
                            >
                                <div className="user-back">
                                    <img src={back} alt="back" />
                                    <span>返回</span>
                                </div>
                            </Link>
                            <div className="user-segmentation" />
                            <div className="user-title">{title}</div>
                        </div>
                        <div className="user-schedule-cut-line" />
                    </div>
                    <div className="user-schedule-body">
                        <div className="user-schedule-mid">
                            <div className="user-schedule-tips">
                                <div className="user-schedule-tips-title">每周六</div>
                                <div className="user-schedule-tips-type">房间类型： {roomType}</div>
                                <div className="user-schedule-tips-inner">
                                    结束于 {this.formatEndTime()} ，共{rate}个房间
                                </div>
                            </div>
                            <div className="schedule-btn-list">
                                <Button>修改周期性房间</Button>
                                <Button danger onClick={this.cancelRoom}>
                                    取消周期性房间
                                </Button>
                            </div>
                            <div className="schedule-room-list">
                                <div className="schedule-room-list-month">
                                    {this.renderRoomTable()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainPageLayout>
        );
    }
}

type Room = {
    roomUUID: string;
    beginTime: number;
    endTime: number;
    roomStatus: RoomStatus;
};

type SortedRoom = {
    yearMonth: string;
    day: string;
    week: string;
    time: string;
    roomStatus: RoomStatus;
    room: Room;
};

type ScheduleRoomProps = {
    periodicUUID: string;
    userUUID: string;
    roomUUID: string;
    title: string;
};

type ScheduleRoomDetailPageState = {
    periodic: {
        ownerUUID: string; // 创建者的 uuid
        endTime: number;
        rate: number | null; // 默认为 0（即 用户选择的是 endTime）
        roomType: RoomType;
    };
    rooms: Room[];
    currentRoom: Room;

    sortedRooms: SortedRoom[];
    toggleCopyModal: boolean;
};
