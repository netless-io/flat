import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { ipcAsyncByMain, ipcReceiveByMain, ipcReceiveRemoveByMain } from "../utils/ipc";
import { useSafePromise } from "../utils/hooks/lifecycle";

export enum ExitRoomConfirmType {
    StopClassButton,
    ExitButton,
}

export interface ExitRoomConfirmProps {
    isCreator: boolean;
    roomStatus: RoomStatus;
    hangClass: () => Promise<void>;
    stopClass: () => Promise<void>;
    // @TODO remove ref
    confirmRef: { current: (confirmType: ExitRoomConfirmType) => void };
}

export const ExitRoomConfirm = observer<ExitRoomConfirmProps>(function ExitRoomConfirm({
    isCreator,
    roomStatus,
    hangClass,
    stopClass,
    confirmRef,
}) {
    const [confirmType, setConfirmType] = useState(ExitRoomConfirmType.ExitButton);
    const [visible, setVisible] = useState(false);
    const [isReturnLoading, setReturnLoading] = useState(false);
    const [isStopLoading, setStopLoading] = useState(false);
    const sp = useSafePromise();
    const pushHistory = usePushHistory();

    const onReturnMain = useCallback(async () => {
        setReturnLoading(true);

        ipcAsyncByMain("set-close-window", {
            close: true,
        });

        try {
            await sp(hangClass());
        } catch (e) {
            setReturnLoading(false);
            console.error(e);
            message.error(e.message);
        }

        pushHistory(RouteNameType.HomePage);
    }, [pushHistory, hangClass, sp]);

    const onStopClass = useCallback(async () => {
        setStopLoading(true);

        try {
            await sp(stopClass());
        } catch (e) {
            setStopLoading(false);
            console.error(e);
            message.error(e.message);
        }
    }, [stopClass, sp]);

    const onCancel = useCallback(() => {
        setVisible(false);
    }, []);

    const confirm = useCallback(
        (confirmType: ExitRoomConfirmType) => {
            if (roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused) {
                setVisible(true);
                setConfirmType(confirmType);
            } else {
                onReturnMain();
            }
        },
        [onReturnMain, roomStatus],
    );

    useEffect(() => {
        ipcAsyncByMain("set-close-window", {
            close: false,
        });
        ipcReceiveByMain("window-will-close", () => {
            confirm(ExitRoomConfirmType.ExitButton);
        });

        return () => {
            ipcAsyncByMain("set-close-window", {
                close: true,
            });

            ipcReceiveRemoveByMain("window-will-close");
        };
    }, [confirm]);

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
                    <Button
                        key="ReturnMain"
                        disabled={isReturnLoading || isStopLoading}
                        loading={isReturnLoading}
                        onClick={onReturnMain}
                    >
                        挂起房间
                    </Button>,
                    <Button
                        key="StopClass"
                        type="primary"
                        disabled={isReturnLoading || isStopLoading}
                        loading={isStopLoading}
                        onClick={onStopClass}
                    >
                        结束上课
                    </Button>,
                ]}
            >
                <p>课堂正在继续，你是暂时退出挂起房间还是结束上课？</p>
            </Modal>
        ) : (
            <Modal visible={visible} title="确定结束上课" onOk={onStopClass} onCancel={onCancel}>
                <p>
                    一旦结束上课，所有用户自动退出房间，并且自动结束课程和录制（如有），不能继续直播。
                </p>
            </Modal>
        )
    ) : (
        <Modal visible={visible} title="确定退出房间" onOk={onReturnMain} onCancel={onCancel}>
            <p>课堂正在继续，确定退出房间？</p>
        </Modal>
    );
});

export default ExitRoomConfirm;
