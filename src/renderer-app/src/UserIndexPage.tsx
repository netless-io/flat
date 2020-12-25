import "./UserIndexPage.less";
import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import { RouteComponentProps } from "react-router";
import { ipcAsyncByMain } from "./utils/ipc";
import { MainRoomMenu } from "./components/MainRoomMenu";
import { MainRoomList } from "./components/MainRoomList";
import { MainRoomHistory } from "./components/MainRoomHistory";
import { Status } from "./components/WeChatLogin";
import { fetcher } from "./utils/fetcher";
import { FLAT_SERVER_ROOM } from "./constants/FlatServer";

export enum RoomType {
    OneToOne,
    SmallClass,
    BigClass,
}

type UserIndexPageState = {
    roomListType: RoomListType;
    rooms: Room[];
};

export enum RoomListType {
    all = "all",
    today = "today",
    cyclical = "cyclical",
    history = "history",
}

export type Room = {
    roomUUID: string;
    cyclicalUUID: string;
    creatorUserUUID: string;
    creatorUserName: string;
    title: string;
    beginTime: string;
    endTime: string;
    roomStatus: "Pending" | "Running" | "Stopped";
};

type CreateRoomSuccessResponse = {
    status: Status.Success;
    data: {
        roomUUID: string;
    };
};

type ListRoomsSuccessResponse = {
    status: Status.Success;
    data: Room[];
};

class UserIndexPage extends React.Component<RouteComponentProps, UserIndexPageState> {
    private isMount = false;
    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            roomListType: RoomListType.all,
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

    private setAsyncState(state: Parameters<React.Component["setState"]>[0]) {
        if (this.isMount) this.setState(state);
    }

    private getCurrentTime() {
        return Number(new Date());
    }

    public createRoom = async (title: string, type: RoomType) => {
        const { data: res } = await fetcher.post<CreateRoomSuccessResponse>(
            FLAT_SERVER_ROOM.CREATE,
            {
                title,
                type,
                beginTime: this.getCurrentTime(),
                // TODO docs: []
            },
        );
        if (res.status === Status.Success) {
            console.log(res.data); // TODO join { roomUUID }
            this.refreshRooms();
        }
    };

    public getListRoomsUrl(type?: RoomListType) {
        return `${FLAT_SERVER_ROOM.LIST}/${type ?? this.state.roomListType}`;
    }

    private refreshRoomId: number | null = null;

    public refreshRooms = async (type?: RoomListType) => {
        if (this.refreshRoomId !== null) {
            window.clearTimeout(this.refreshRoomId);
        }
        // TODO page
        const { data: res } = await fetcher.get<ListRoomsSuccessResponse>(
            this.getListRoomsUrl(type),
            { params: { page: 1 } },
        );
        if (res.status === Status.Success) {
            this.setAsyncState({ rooms: res.data });
        }
        if (this.isMount) {
            this.refreshRoomId = window.setTimeout(this.refreshRooms, 30 * 1000);
        } else {
            this.refreshRoomId = null;
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
                    />
                    <MainRoomHistory />
                </div>
            </MainPageLayout>
        );
    }
}

export default UserIndexPage;
