import * as React from "react";
import { Button, Modal, Tooltip } from "antd";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { Room } from "white-web-sdk";
import "./ExitButton.less";
import exit from "../assets/image/exit.svg";
import replayScreen from "../assets/image/replay-screen.png";
import { Identity } from "../IndexPage";

export type ExitButtonRoomStates = {
    exitViewDisable: boolean;
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
        };
    }

    private handleReplay = async (): Promise<void> => {
        const { room, userId, identity } = this.props;
        if (room) {
            await room.disconnect();
            this.props.history.push(`/replay/${identity}/${room.uuid}/${userId}/`);
        }
    };

    private handleGoBack = async (): Promise<void> => {
        const { room } = this.props;
        await room.disconnect();
        this.props.history.push("/");
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
                            <img className="modal-box-img" src={replayScreen} />
                        </div>
                        <div className="modal-box-name">观看回放</div>
                        <Button onClick={this.handleGoBack} style={{ width: 176 }} size="large">
                            确认退出
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default withRouter(ExitButtonRoom);
