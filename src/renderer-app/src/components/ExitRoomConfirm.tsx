import React, { useEffect, useState } from "react";
import { Modal, Button } from "antd";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";

export enum ExitRoomConfirmType {
    StopClassButton,
    ExitButton,
}

export interface ExitRoomConfirmProps {
    isCreator: boolean;
    roomStatus: RoomStatus;
    stopClass: () => Promise<void>;
    // @TODO remove ref
    confirmRef: { current: (confirmType: ExitRoomConfirmType) => void };
}

export const ExitRoomConfirm = observer<ExitRoomConfirmProps>(function ExitRoomConfirm({
    isCreator,
    roomStatus,
    stopClass,
    confirmRef,
}) {
    const [confirmType, setConfirmType] = useState(ExitRoomConfirmType.ExitButton);
    const [visible, setVisible] = useState(false);
    const history = useHistory();

    useEffect(() => {
        // @TODO 监听 ipc
        // ipcRenderer.on("");
        // if (
        //     this.props.roomStatus === RoomStatus.Started ||
        //     this.props.roomStatus === RoomStatus.Paused
        // ) {
        // }
    }, []);

    confirmRef.current = confirm;

    return isCreator ? (
        confirmType === ExitRoomConfirmType.ExitButton ? (
            <Modal
                visible={visible}
                title="关闭选项"
                onOk={onCancel}
                onCancel={onCancel}
                footer={[
                    <Button key="Cancel" onClick={onCancel}>
                        取消
                    </Button>,
                    <Button key="ReturnMain" onClick={onReturnMain}>
                        挂起房间
                    </Button>,
                    <Button key="StopClass" type="primary" onClick={onStopClass}>
                        结束上课
                    </Button>,
                ]}
            >
                <p>课堂正在继续，你是暂时退出挂起房间还是结束上课？</p>
            </Modal>
        ) : (
            <Modal visible={visible} title="确认结束上课" onOk={onStopClass} onCancel={onCancel}>
                <p>
                    一旦结束上课，所有用户自动退出房间，并且自动结束课程和录制（如有），不能继续直播。
                </p>
            </Modal>
        )
    ) : (
        <Modal visible={visible} title="确认退出房间" onOk={onReturnMain} onCancel={onCancel}>
            <p>课堂正在继续，确认退出房间？</p>
        </Modal>
    );

    function onReturnMain(): void {
        setVisible(false);
        history.push("/user/");
    }

    function onStopClass(): void {
        setVisible(false);
        stopClass();
    }

    function onCancel(): void {
        setVisible(false);
    }

    function confirm(confirmType: ExitRoomConfirmType): void {
        if (roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused) {
            setVisible(true);
            setConfirmType(confirmType);
        } else {
            onReturnMain();
        }
    }
});

export default ExitRoomConfirm;
