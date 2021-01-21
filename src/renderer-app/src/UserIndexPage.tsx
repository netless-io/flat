import "./UserIndexPage.less";
import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import { RouteComponentProps } from "react-router";
import { ipcAsyncByMain } from "./utils/ipc";
import { MainRoomMenu } from "./components/MainRoomMenu";
import { MainRoomList } from "./components/MainRoomList";
import { MainRoomHistory } from "./components/MainRoomHistory";
import { globals } from "./utils/globals";
import { Identity } from "./utils/localStorage/room";
import {
    createOrdinaryRoom,
    joinRoom,
    ListRoomsType,
    listRooms,
    FlatServerRoom,
} from "./apiMiddleware/flatServer";
import { RoomStatus, RoomType } from "./apiMiddleware/flatServer/constants";
import { getUserUuid } from "./utils/localStorage/accounts";
import { globalStore } from "./stores/GlobalStore";

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

    public componentDidMount() {
        this.isMount = true;
        this.refreshRooms();
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 668,
            autoCenter: true,
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

    public createOrdinaryRoom = async (title: string, type: RoomType) => {
        const roomUUID = await createOrdinaryRoom({
            title,
            type,
            beginTime: this.getCurrentTime(),
            // TODO docs:[]
        });
        await this.joinRoom(roomUUID, Identity.creator);
    };

    public joinRoom = async (roomUUID: string, identity: Identity) => {
        const data = await joinRoom(roomUUID);

        // @TODO remove globals
        globals.whiteboard.uuid = data.whiteboardRoomUUID;
        globals.whiteboard.token = data.whiteboardRoomToken;
        globals.rtc.uid = data.rtcUID;
        globals.rtc.token = data.rtcToken;
        globals.rtm.token = data.rtmToken;

        globalStore.updateToken({
            whiteboardUUID: data.whiteboardRoomUUID,
            whiteboardToken: data.whiteboardRoomToken,
            rtcToken: data.rtcToken,
            rtmToken: data.rtmToken,
        });

        const url = `/${data.roomType}/${identity}/${data.roomUUID}/${getUserUuid()}/`;
        this.historyPush(url);
    };

    public refreshRooms = async (type?: ListRoomsType) => {
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

    public setListRoomsType = (roomListType: ListRoomsType) => {
        this.setAsyncState({ roomListType });
        this.refreshRooms(roomListType);
    };

    public render(): React.ReactNode {
        return (
            <MainPageLayout columnLayout>
                <MainRoomMenu
                    onCreateRoom={this.createOrdinaryRoom}
                    onJoinRoom={roomID => {
                        this.joinRoom(roomID, Identity.joiner);
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
