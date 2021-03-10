import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { observer } from "mobx-react-lite";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { RouteNameType, usePushHistory } from "../../utils/routes";

export interface RoomStatusStoppedModalProps {
    isCreator: boolean;
    roomStatus: RoomStatus;
}

/**
 * Show an info modal on joiner side when room status becomes stopped
 */
export const RoomStatusStoppedModal = observer<RoomStatusStoppedModalProps>(
    function RoomStatusStoppedModal({ isCreator, roomStatus }) {
        const modalRef = useRef<ReturnType<typeof Modal.info>>();
        const [visible, setVisible] = useState(false);
        const pushHistory = usePushHistory();

        const exit = useCallback(() => {
            pushHistory(RouteNameType.HomePage);
        }, [pushHistory]);

        useEffect(() => {
            if (roomStatus === RoomStatus.Stopped) {
                if (isCreator) {
                    exit();
                } else {
                    setVisible(true);
                }
            }
        }, [roomStatus, isCreator, exit]);

        useEffect(() => {
            let ticket: number | undefined;

            if (visible) {
                let countdown = 5;
                modalRef.current = Modal.info({
                    title: "房间已结束，即将退出...",
                    okText: `知道了 (${countdown})`,
                    onOk: exit,
                    onCancel: exit,
                });
                ticket = window.setInterval(() => {
                    modalRef.current?.update({
                        okText: `知道了 (${--countdown})`,
                    });
                    if (countdown <= 0) {
                        window.clearInterval(ticket);
                        exit();
                    }
                }, 1000);
            }

            return () => {
                window.clearInterval(ticket);
                modalRef.current?.destroy();
            };
        }, [visible, exit]);

        return null;
    },
);

export default RoomStatusStoppedModal;
