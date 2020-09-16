import * as React from "react";
import { Button, message, Modal, Tooltip } from "antd";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { Room } from "white-web-sdk";
import "./ExitButton.less";
import exit from "../assets/image/exit.svg";
import replayScreen from "../assets/image/replay-screen.png";
import { Identity } from "../IndexPage";
import { netlessWhiteboardApi } from "../apiMiddleware";
import { LocalStorageRoomDataType } from "../HistoryPage";

export type ExitButtonRoomStates = {
    exitViewDisable: boolean;
    isLoading: boolean;
};

export type ExitButtonRoomProps = {
    room: Room;
    userId: string;
    identity: Identity;
} & RouteComponentProps<{}>;

class ExitButtonRoom extends React.Component<ExitButtonRoomProps, ExitButtonRoomStates> {
    public constructor(props: ExitButtonRoomProps) {
        super(props);
        this.state = {
            exitViewDisable: false,
            isLoading: false,
        };
    }

    private handleReplay = async (): Promise<void> => {
        const { room, userId, identity } = this.props;
        if (room) {
            await this.setCover(room);
            await room.disconnect();
            this.props.history.push(`/replay/${identity}/${room.uuid}/${userId}/`);
        }
    };

    private handleGoBack = async (): Promise<void> => {
        const { room } = this.props;
        await this.setCover(room);
        await room.disconnect();
        this.props.history.push("/");
    };

    private setCover = async (room: Room): Promise<void> => {
        try {
            this.setState({ isLoading: true });
            const res = await netlessWhiteboardApi.room.getCover(
                room.uuid,
                room.state.sceneState.scenePath,
                96,
                72,
                room.roomToken,
            );
            const rooms = localStorage.getItem("rooms");
            if (rooms) {
                const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
                const roomData = roomArray.find(data => data.uuid === room.uuid);
                const newRoomData = roomArray.filter(data => data.uuid !== room.uuid);
                if (roomData) {
                    roomData.cover = res.url;
                }
                localStorage.setItem("rooms", JSON.stringify([roomData, ...newRoomData]));
            }
            this.setState({ isLoading: false });
        } catch (error) {
            message.error(error);
            this.setState({ isLoading: false });
        }
    };

    public render(): React.ReactNode {
        return (
            <div>
                <Tooltip placement="bottom" title={"Exit"}>
                    <div
                        className="page-controller-cell"
                        onClick={() => this.setState({ exitViewDisable: true })}
                    >
                        <img src={exit} />
                    </div>
                </Tooltip>
                <Modal
                    visible={this.state.exitViewDisable}
                    footer={null}
                    title={"退出教室"}
                    onCancel={() => this.setState({ exitViewDisable: false })}
                >
                    <div className="modal-box">
                        <div onClick={this.handleReplay}>
                            <img
                                className="modal-box-img"
                                src={replayScreen}
                                alt={"replayScreen"}
                            />
                        </div>
                        <div className="modal-box-name">观看回放</div>
                        <Button
                            loading={this.state.isLoading}
                            onClick={this.handleGoBack}
                            style={{ width: 176 }}
                            size="large"
                        >
                            确认退出
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default withRouter(ExitButtonRoom);
