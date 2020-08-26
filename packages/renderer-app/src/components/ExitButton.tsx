import * as React from "react";
import { Button, Modal } from "antd";
import { RouteComponentProps, withRouter } from "react-router";
import { Room } from "white-web-sdk";
import "./ExitButton.less";
import exit from "../assets/image/exit.svg";
import replayScreen from "../assets/image/replay-screen.png";

export type ExitButtonStates = {
    exitViewDisable: boolean;
};

export type ExitButtonProps = {
    room: Room;
    userId: string;
} & RouteComponentProps<{}>;

class ExitButton extends React.Component<ExitButtonProps, ExitButtonStates> {
    public constructor(props: ExitButtonProps) {
        super(props);
        this.state = {
            exitViewDisable: false,
        };
    }

    private handleReplay = async (): Promise<void> => {
        const { room, userId } = this.props;
        if (room) {
            await room.disconnect();
            this.props.history.push(`/replay/${room.uuid}/${userId}/`);
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
                <div
                    className="page-controller-cell"
                    onClick={() => this.setState({ exitViewDisable: true })}
                >
                    <img src={exit} />
                </div>
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

export default withRouter(ExitButton);
