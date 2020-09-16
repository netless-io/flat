import * as React from "react";
import { Redirect } from "react-router";
import { message } from "antd";
import { RouteComponentProps } from "react-router";
import PageError from "./PageError";
import { netlessWhiteboardApi, RoomType } from "./apiMiddleware";
import LoadingPage from "./LoadingPage";
import { ipcRenderer } from "electron";
import { Identity } from "./IndexPage";
import { LocalStorageRoomDataType } from "./HistoryPage";
import moment from "moment";

export type WhiteboardCreatorPageState = {
    uuid?: string;
    userId?: string;
    foundError: boolean;
};

export type WhiteboardCreatorPageProps = RouteComponentProps<{
    identity: Identity;
    uuid?: string;
}>;

export default class WhiteboardCreatorPage extends React.Component<
    WhiteboardCreatorPageProps,
    WhiteboardCreatorPageState
> {
    public constructor(props: WhiteboardCreatorPageProps) {
        super(props);
        this.state = {
            foundError: false,
        };
        ipcRenderer.send("mainSource", {
            actions: "set-win-size",
            args: {
                width: 1200,
                height: 800,
            },
        });
    }

    private createRoomAndGetUuid = async (
        room: string,
        limit: number,
        mode: RoomType,
    ): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.createRoomApi(room, limit, mode);
        if (res.code === 200) {
            return res.msg.room.uuid;
        } else {
            return null;
        }
    };

    public setRoomList = (uuid: string, userId: string): void => {
        const rooms = localStorage.getItem("rooms");
        const timestamp = moment(new Date()).format("lll");
        if (rooms) {
            const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
            const room = roomArray.find(data => data.uuid === uuid);
            if (!room) {
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.teacher,
                            userId: userId,
                        },
                        ...roomArray,
                    ]),
                );
            } else {
                const newRoomArray = roomArray.filter(data => data.uuid !== uuid);
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.teacher,
                            userId: userId,
                        },
                        ...newRoomArray,
                    ]),
                );
            }
        } else {
            localStorage.setItem(
                "rooms",
                JSON.stringify([
                    {
                        uuid: uuid,
                        time: timestamp,
                        identity: Identity.teacher,
                        userId: userId,
                    },
                ]),
            );
        }
    };
    public async componentDidMount(): Promise<void> {
        try {
            const userId = `${Math.floor(Math.random() * 100000)}`;
            let uuid: string | null;
            if (this.props.match.params.uuid) {
                uuid = this.props.match.params.uuid;
            } else {
                uuid = await this.createRoomAndGetUuid("netless", 0, RoomType.historied);
                if (uuid) {
                    this.setRoomList(uuid, userId);
                }
            }
            this.setState({ userId: userId });
            if (uuid) {
                this.setState({ uuid: uuid });
            } else {
                message.error("create room fail");
            }
        } catch (error) {
            this.setState({ foundError: true });
            throw error;
        }
    }

    public render(): React.ReactNode {
        const { uuid, userId, foundError } = this.state;
        const { identity } = this.props.match.params;
        if (foundError) {
            return <PageError />;
        } else if (localStorage.getItem("userName") === null) {
            if (uuid) {
                return <Redirect to={`/name/${uuid}`} />;
            } else {
                return <Redirect to={`/name/`} />;
            }
        } else if (uuid && userId) {
            return <Redirect to={`/whiteboard/${identity}/${uuid}/${userId}/`} />;
        }
        return <LoadingPage />;
    }
}
