import "./UserIndexPage.less";
import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import { RouteComponentProps } from "react-router";
import { ipcAsyncByMain } from "./utils/ipc";
import { MainRoomMenu } from "./components/MainRoomMenu";
import { MainRoomList } from "./components/MainRoomList";
import { MainRoomHistory } from "./components/MainRoomHistory";
import {
    createOrdinaryRoom,
    ListRoomsType,
    listRooms,
    FlatServerRoom,
} from "./apiMiddleware/flatServer";
import { RoomStatus, RoomType } from "./apiMiddleware/flatServer/constants";
import { roomStore } from "./stores/RoomStore";

export type UserIndexPageProps = RouteComponentProps;

export interface UserIndexPageState {
    roomListType: ListRoomsType;
    rooms: FlatServerRoom[];
    historyRooms: FlatServerRoom[];
    historyRoomListType: ListRoomsType;
}

class UserIndexPage extends React.Component<UserIndexPageProps, UserIndexPageState> {
    private isMount = false;
    private refreshRoomsId: number | null = null;

    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            roomListType: ListRoomsType.All,
            rooms: [],
            historyRooms: [],
            historyRoomListType: ListRoomsType.History,
        };
    }

    public componentDidMount(): void {
        this.isMount = true;
        this.refreshRooms();
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 668,
            autoCenter: true,
        });
    }

    public componentWillUnmount(): void {
        this.isMount = false;
    }

    public historyPush = (path: string): void => {
        if (this.isMount) this.props.history.push(path);
    };

    private setAsyncState(state: Parameters<React.Component["setState"]>[0]): void {
        if (this.isMount) this.setState(state);
    }

    private getCurrentTime(): number {
        return Date.now();
    }

    public createOrdinaryRoom = async (title: string, type: RoomType): Promise<void> => {
        const roomUUID = await createOrdinaryRoom({
            title,
            type,
            beginTime: this.getCurrentTime(),
            // TODO docs:[]
        });
        await this.joinRoom(roomUUID);
    };

    public joinRoom = async (roomUUID: string): Promise<void> => {
        const data = await roomStore.joinRoom(roomUUID);
        const url = `/classroom/${data.roomType}/${data.roomUUID}/${data.ownerUUID}`;
        this.historyPush(url);
    };

    public refreshRooms = async (type?: ListRoomsType): Promise<void> => {
        if (this.refreshRoomsId !== null) {
            window.clearTimeout(this.refreshRoomsId);
        }
        // TODO page?
        try {
            const rooms = await listRooms(type ?? this.state.roomListType, { page: 1 });
            const historyRooms = await listRooms(this.state.historyRoomListType, { page: 1 });
            const started: FlatServerRoom[] = [];
            const paused: FlatServerRoom[] = [];
            const idle: FlatServerRoom[] = [];
            const stopped: FlatServerRoom[] = [];
            for (const room of rooms) {
                switch (room.roomStatus) {
                    case RoomStatus.Started: {
                        started.push(room);
                        break;
                    }
                    case RoomStatus.Paused: {
                        paused.push(room);
                        break;
                    }
                    case RoomStatus.Stopped: {
                        stopped.push(room);
                        break;
                    }
                    default: {
                        idle.push(room);
                    }
                }
            }

            this.setAsyncState({
                rooms: [...started, ...paused, ...idle, ...stopped],
                historyRooms: historyRooms,
            });
        } catch (error) {
            // @TODO handle error
            console.log(error);
        }

        if (this.isMount) {
            this.refreshRoomsId = window.setTimeout(this.refreshRooms, 30 * 1000);
        } else {
            this.refreshRoomsId = null;
        }
    };

    public setListRoomsType = (roomListType: ListRoomsType): void => {
        this.setAsyncState({ roomListType });
        this.refreshRooms(roomListType);
    };

    public render(): React.ReactNode {
        return (
            <MainPageLayout columnLayout>
                <MainRoomMenu
                    onCreateRoom={this.createOrdinaryRoom}
                    onJoinRoom={roomUUID => {
                        this.joinRoom(roomUUID);
                    }}
                />
                <div className="main-room-layout">
                    <MainRoomList
                        rooms={this.state.rooms}
                        type={this.state.roomListType}
                        onTypeChange={this.setListRoomsType}
                        historyPush={this.historyPush}
                    />
                    <MainRoomHistory
                        rooms={this.state.historyRooms}
                        historyPush={this.historyPush}
                    />
                </div>
            </MainPageLayout>
        );
    }
}

export default UserIndexPage;
