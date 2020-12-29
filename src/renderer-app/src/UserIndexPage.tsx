import "./UserIndexPage.less";
import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import {RouteComponentProps} from "react-router";
import {ipcAsyncByMain} from "./utils/ipc";
import {MainRoomMenu} from "./components/MainRoomMenu";
import {MainRoomList, RoomStatus} from "./components/MainRoomList";
import { MainRoomHistory } from "./components/MainRoomHistory";
import { Status } from "./components/WeChatLogin";
import { fetcher } from "./utils/fetcher";
import { FLAT_SERVER_ROOM } from "./constants/FlatServer";
import { globals } from "./utils/globals";
import { Identity } from "./utils/localStorage/room";

type UserIndexPageState = {
    roomListType: RoomListType;
    rooms: Room[];
}

export type Room = {
    roomUUID: string;
    periodicUUID: string;
    ownerUUID: string;
    ownerName: string;
    title: string;
    beginTime: string;
    endTime: string;
    roomStatus: RoomStatus;
}

export enum RoomType {
    OneToOne,
    SmallClass,
    BigClass,
}

export enum RoomListType {
    All = "all",
    Today = "today",
    Periodic = "periodic",
    History = "history",
}

type CreateRoomSuccessResponse = {
    status: Status.Success;
    data: {
        roomUUID: string;
    }
}

type ListRoomsSuccessResponse = {
    status: Status.Success;
    data: Room[];
}

export type JoinRoomResult = {
    whitboardRoomToken: string;
    whiteboardRoomUUID: string;
    roomUUID: string;
}

export type JoinCyclicalRoomResult = {
    whiteboardRoomToken: string;
    whiteboardRoomUUID: string;
}

export type SuccessResponse<T> = {
    status: Status;
    data: T;
}


class UserIndexPage extends React.Component<RouteComponentProps, UserIndexPageState> {
    private isMount = false;
    private refreshRoomsId: number | null = null;

    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            roomListType: RoomListType.All,
            rooms: [],
        };
    }

    public componentDidMount() {
        this.isMount = true;
        this.refreshRooms();
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 668,
        });
    }

    public componentWillUnmount() {
        this.isMount = false;
    }

    public historyPush = (path: string) => {
        if (this.isMount) this.props.history.push(path);
    };

    private setAsyncState(state: Parameters<React.Component["setState"]>[0]) {
        if (this.isMount) this.setState(state);
    }

    private getCurrentTime() {
        return Date.now();
    }

    public createRoom = async (title: string, type: RoomType) => {
        const { data: res } = await fetcher.post<CreateRoomSuccessResponse>(
            FLAT_SERVER_ROOM.CREATE,
            {
                title,
                type,
                beginTime: this.getCurrentTime(),
                // TODO docs:[]
            },
        );
        // this.refreshRooms();
        if (res.status === Status.Success) {
            await this.joinRoom(res.data.roomUUID);
        }
    };

    public joinRoom = async (roomUUID: string) => {
        const { data: res } = await fetcher.post<SuccessResponse<JoinRoomResult>>(
            FLAT_SERVER_ROOM.JOIN_ORDINARY,
            { roomUUID },
        );
        if (res.status === Status.Success) {
            globals.whiteboard.uuid = res.data.whiteboardRoomUUID;
            globals.whiteboard.token = res.data.whitboardRoomToken;
            const url = `/whiteboard/${Identity.creator}/${res.data.whiteboardRoomUUID}/`;
            this.historyPush(url);
        }
    };

    public getListRoomsUrl(type?: RoomListType) {
        return `${FLAT_SERVER_ROOM.LIST}/${type ?? this.state.roomListType}`;
    }

    public refreshRooms = async (type?: RoomListType) => {
        if (this.refreshRoomsId !== null) {
            window.clearTimeout(this.refreshRoomsId);
        }
        // TODO page?
        try {
            const { data: res } = await fetcher.get<ListRoomsSuccessResponse>(
                this.getListRoomsUrl(type),
                { params: { page: 1 } },
            );
            if (res.status === Status.Success) {
                const running = res.data.filter(e => e.roomStatus === "Running");
                const notRunning = res.data.filter(e => e.roomStatus !== "Running");
                this.setAsyncState({ rooms: [...running, ...notRunning] });
            }
        } catch (error) {
            console.log(error);
        }

        if (this.isMount) {
            this.refreshRoomsId = window.setTimeout(this.refreshRooms, 30 * 1000);
        } else {
            this.refreshRoomsId = null;
        }
    };

    public setRoomListType = (roomListType: RoomListType) => {
        this.setAsyncState({ roomListType });
        this.refreshRooms(roomListType);
    };

    public render(): React.ReactNode {
        return (
            <MainPageLayout columnLayout>
                <MainRoomMenu onCreateRoom={this.createRoom} />
                <div className="main-room-layout">
                    <MainRoomList
                        rooms={this.state.rooms}
                        type={this.state.roomListType}
                        onTypeChange={this.setRoomListType}
                        historyPush={this.historyPush}
                    />
                    <MainRoomHistory />
                </div>
            </MainPageLayout>
        );
    }
}

export default UserIndexPage;
