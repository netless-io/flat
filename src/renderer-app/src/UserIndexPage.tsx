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
    createRoom,
    joinRoom,
    ListRoomsType,
    listRooms,
    FlatServerRoom,
} from "./apiMiddleware/flatServer";
import { RoomType } from "./apiMiddleware/flatServer/constants";
import { getUserUuid } from "./utils/localStorage/accounts";

export type UserIndexPageProps = RouteComponentProps;

export interface UserIndexPageState {
    roomListType: ListRoomsType;
    rooms: FlatServerRoom[];
}

class UserIndexPage extends React.Component<UserIndexPageProps, UserIndexPageState> {
    private isMount = false;
    private refreshRoomsId: number | null = null;

    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            roomListType: ListRoomsType.All,
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
        const roomUUID = await createRoom({
            title,
            type,
            beginTime: this.getCurrentTime(),
            // TODO docs:[]
        });
        await this.joinRoom(roomUUID, Identity.creator);
    };

    public joinRoom = async (roomUUID: string, identity: Identity) => {
        const data = await joinRoom(roomUUID);
        globals.whiteboard.uuid = data.whiteboardRoomUUID;
        globals.whiteboard.token = data.whiteboardRoomToken;
        globals.rtc.uid = data.rtcUID;
        globals.rtc.token = data.rtcToken;
        globals.rtm.token = data.rtmToken;

        const url = `/${data.roomType}/${identity}/${data.roomUUID}/${getUserUuid()}/`;
        this.historyPush(url);
    };

    public refreshRooms = async (type?: ListRoomsType) => {
        if (this.refreshRoomsId !== null) {
            window.clearTimeout(this.refreshRoomsId);
        }
        // TODO page?
        try {
            const data = await listRooms(type ?? this.state.roomListType, { page: 1 });
            const running = data.filter(e => e.roomStatus === "Running");
            const notRunning = data.filter(e => e.roomStatus !== "Running");
            this.setAsyncState({ rooms: [...running, ...notRunning] });
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
                    onCreateRoom={this.createRoom}
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
                    <MainRoomHistory />
                </div>
            </MainPageLayout>
        );
    }
}

export default UserIndexPage;
