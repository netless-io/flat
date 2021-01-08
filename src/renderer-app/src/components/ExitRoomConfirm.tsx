import React from "react";
import { Modal, Button } from "antd";
import { History } from "history";
import { ClassStatusType } from "../apiMiddleware/Rtm";
import { Identity } from "../utils/localStorage/room";

export enum ExitRoomConfirmType {
    StopClassButton,
    ExitButton,
}

export interface ExitRoomConfirmProps {
    identity: Identity;
    history: History;
    classStatus: ClassStatusType;
    stopClass: () => void;
    // @TODO remove ref
    confirmRef: { current: (confirmType: ExitRoomConfirmType) => void };
}

export interface ExitRoomConfirmState {
    confirmType: ExitRoomConfirmType;
    visible: boolean;
}

export class ExitRoomConfirm extends React.PureComponent<
    ExitRoomConfirmProps,
    ExitRoomConfirmState
> {
    constructor(props: ExitRoomConfirmProps) {
        super(props);

        this.state = {
            confirmType: ExitRoomConfirmType.ExitButton,
            visible: false,
        };

        // @TODO remove ref
        this.props.confirmRef.current = this.confirm;
    }

    componentDidMount() {
        // @TODO 监听 ipc
        // ipcRenderer.on("");
        // if (
        //     this.props.classStatus === ClassStatusType.Started ||
        //     this.props.classStatus === ClassStatusType.Paused
        // ) {
        // }
    }

    render(): React.ReactNode {
        const { identity } = this.props;
        const { visible, confirmType } = this.state;
        return identity === Identity.creator ? (
            confirmType === ExitRoomConfirmType.ExitButton ? (
                <Modal
                    visible={visible}
                    title="关闭选项"
                    onOk={this.onCancel}
                    onCancel={this.onCancel}
                    footer={[
                        <Button key="Cancel" onClick={this.onCancel}>
                            取消
                        </Button>,
                        <Button key="ReturnMain" onClick={this.onReturnMain}>
                            挂起房间
                        </Button>,
                        <Button key="StopClass" type="primary" onClick={this.onStopClass}>
                            结束上课
                        </Button>,
                    ]}
                >
                    <p>课堂正在继续，你是暂时退出挂起房间还是结束上课？</p>
                </Modal>
            ) : (
                <Modal
                    visible={visible}
                    title="确认结束上课"
                    onOk={this.onStopClass}
                    onCancel={this.onCancel}
                >
                    <p>
                        一旦结束上课，所有用户自动退出房间，并且自动结束课程和录制（如有），不能继续直播。
                    </p>
                </Modal>
            )
        ) : (
            <Modal
                visible={visible}
                title="确认退出房间"
                onOk={this.onReturnMain}
                onCancel={this.onCancel}
            >
                <p>课堂正在继续，确认退出房间？</p>
            </Modal>
        );
    }

    private onReturnMain = (): void => {
        this.setState({ visible: false });
        this.props.history.push("/users/");
    };

    private onStopClass = (): void => {
        this.setState({ visible: false });
        this.props.stopClass();
    };

    private onCancel = (): void => {
        this.setState({ visible: false });
    };

    private confirm = (confirmType: ExitRoomConfirmType): void => {
        if (
            this.props.classStatus === ClassStatusType.Started ||
            this.props.classStatus === ClassStatusType.Paused
        ) {
            this.setState({ visible: true, confirmType });
        }
    };
}

export default ExitRoomConfirm;
