import * as React from "react";
import { Button, Modal, Tooltip } from "antd";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { Player } from "white-web-sdk";
import "./ExitButton.less";
import exit from "../assets/image/exit.svg";
import replayScreen from "../assets/image/replay-screen.png";
import { Identity } from "../IndexPage";

export type ExitButtonPlayerStates = {
    exitViewDisable: boolean;
};

export type ExitButtonPlayerProps = {
    player: Player;
    identity: Identity;
    uuid: string;
    userId: string;
} & RouteComponentProps<{}>;

class ExitButtonPlayer extends React.Component<ExitButtonPlayerProps, ExitButtonPlayerStates> {
    public constructor(props: ExitButtonPlayerProps) {
        super(props);
        this.state = {
            exitViewDisable: false,
        };
    }

    private handleReplay = async (): Promise<void> => {
        const { identity, uuid, userId } = this.props;
        this.props.history.push(`/whiteboard/${identity}/${uuid}/${userId}/`);
    };

    private handleGoBack = async (): Promise<void> => {
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
                    title={"退出回放"}
                    onCancel={() => this.setState({ exitViewDisable: false })}
                >
                    <div className="modal-box">
                        <div onClick={this.handleReplay}>
                            <img className="modal-box-img" src={replayScreen} />
                        </div>
                        <div className="modal-box-name">回到白板</div>
                        <Button onClick={this.handleGoBack} style={{ width: 176 }} size="large">
                            确认退出
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default withRouter(ExitButtonPlayer);
