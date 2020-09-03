import * as React from "react";
import { Redirect } from "react-router";
import { message } from "antd";
import { RouteComponentProps } from "react-router";
import PageError from "./PageError";
import { netlessWhiteboardApi, RoomType } from "./apiMiddleware";
import LoadingPage from "./LoadingPage";

export type WhiteboardCreatorPageState = {
    uuid?: string;
    userId?: string;
    foundError: boolean;
};

export type WhiteboardCreatorPageProps = RouteComponentProps<{
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
    public async componentWillMount(): Promise<void> {
        try {
            let uuid: string | null;
            if (this.props.match.params.uuid) {
                uuid = this.props.match.params.uuid;
            } else {
                uuid = await this.createRoomAndGetUuid("test1", 0, RoomType.historied);
            }
            const userId = `${Math.floor(Math.random() * 100000)}`;
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
        if (foundError) {
            return <PageError />;
        } else if (localStorage.getItem("userName") === null) {
            if (uuid) {
                return <Redirect to={`/name/${uuid}`} />;
            } else {
                return <Redirect to={`/name/`} />;
            }
        } else if (uuid && userId) {
            return <Redirect to={`/whiteboard/${uuid}/${userId}/`} />;
        }
        return <LoadingPage />;
    }
}
