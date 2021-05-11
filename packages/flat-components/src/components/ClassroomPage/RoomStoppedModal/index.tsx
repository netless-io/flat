import { Modal } from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { RoomStatus } from "../../../types/room";

export interface RoomStoppedModalProps {
    isCreator: boolean;
    roomStatus: RoomStatus;
    onExit: () => void;
}

/**
 * Show an info modal on joiner side when room status becomes stopped.
 *
 * **Note**: be sure to use `useCallback` when passing the `onExit` prop.
 */
export const RoomStoppedModal: FC<RoomStoppedModalProps> = ({ isCreator, roomStatus, onExit }) => {
    const modalRef = useRef<ReturnType<typeof Modal.info>>();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (roomStatus === RoomStatus.Stopped) {
            if (isCreator) {
                onExit();
            } else {
                setVisible(true);
            }
        }
    }, [roomStatus, isCreator, onExit]);

    useEffect(() => {
        let ticket: number | undefined;

        if (visible) {
            let countdown = 5;
            modalRef.current = Modal.info({
                title: "房间已结束，即将退出...",
                okText: `知道了 (${countdown})`,
                onOk: onExit,
                onCancel: onExit,
            });
            ticket = window.setInterval(() => {
                modalRef.current?.update({
                    okText: `知道了 (${--countdown})`,
                });
                if (countdown <= 0) {
                    window.clearInterval(ticket);
                    onExit();
                }
            }, 1000);
        }

        return () => {
            window.clearInterval(ticket);
            modalRef.current?.destroy();
        };
    }, [visible, onExit]);

    return null;
};
