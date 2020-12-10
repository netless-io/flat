import React from "react";
import { Button, message, Modal, Tooltip } from "antd";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { Room } from "white-web-sdk";
import { Identity } from "../IndexPage";
import { netlessWhiteboardApi } from "../apiMiddleware";
import { LocalStorageRoomDataType } from "../HistoryPage";

import replayScreen from "../assets/image/replay-screen.png";
import exit from "../assets/image/exit.svg";
import "./ExitButton.less";

export type ExitButtonRoomStates = {
    exitViewDisable: boolean;
    isLoading: boolean;
};

export type ExitButtonRoomProps = {
    room: Room;
    userId: string;
    identity: Identity;
} & RouteComponentProps<{}>;

class ExitButtonRoom extends React.PureComponent<ExitButtonRoomProps, ExitButtonRoomStates> {
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
            try {
                const res = await netlessWhiteboardApi.room.getCover(
                    room.uuid,
                    room.state.sceneState.scenePath,
                    192,
                    144,
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
            } catch (error) {
                console.error(error);
            }
            this.setState({ isLoading: false });
        } catch (error) {
            message.error(error);
            this.setState({ isLoading: false });
        }
    };

    private disableExitView = () => this.setState({ exitViewDisable: true });

    private enableExitView = () => this.setState({ exitViewDisable: false });

    public render(): React.ReactNode {
        return (
            <>
                <Tooltip placement="bottom" title={"Exit"}>
                    <button className="topbar-content-right-cell" onClick={this.disableExitView}>
                        <img src={exit} />
                    </button>
                </Tooltip>
                <Modal
                    visible={this.state.exitViewDisable}
                    footer={null}
                    title={"退出教室"}
                    onCancel={this.enableExitView}
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
            </>
        );
    }
}

export default withRouter(ExitButtonRoom);
