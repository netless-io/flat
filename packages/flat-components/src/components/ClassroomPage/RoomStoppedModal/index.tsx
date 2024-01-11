import { FC, useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { RoomStatus } from "../../../types/room";

export interface RoomStoppedModalProps {
    isRemoteLogin: boolean;
    isExitConfirmModalVisible: boolean;
    roomStatus: RoomStatus;
    onExit: () => void;
}

/**
 * Show an info modal on joiner side when room status becomes stopped.
 *
 * **Note**: be sure to use `useCallback` when passing the `onExit` prop.
 */
export const RoomStoppedModal: FC<RoomStoppedModalProps> = ({
    isRemoteLogin,
    isExitConfirmModalVisible,
    roomStatus,
    onExit,
}) => {
    const modalRef = useRef<ReturnType<typeof Modal.info>>();
    const [visible, setVisible] = useState(false);
    const t = useTranslate();

    useEffect(() => {
        if (isRemoteLogin) {
            setVisible(true);
        }
    }, [isRemoteLogin]);

    useEffect(() => {
        if (roomStatus === RoomStatus.Stopped) {
            if (isExitConfirmModalVisible) {
                onExit();
            } else {
                setVisible(true);
            }
        }
    }, [roomStatus]);

    useEffect(() => {
        let ticket: number | undefined;

        if (visible) {
            let countdown = 5;

            modalRef.current = Modal.info({
                title: isRemoteLogin
                    ? t("you-have-entered-the-room-at-another-device")
                    : t("the-room-has-ended-and-is-about-to-exit"),
                okText: t("got-it-countdown", { countdown }),
                onOk: onExit,
                onCancel: onExit,
            });

            ticket = window.setInterval(() => {
                modalRef.current?.update({
                    okText: t("got-it-countdown", { countdown: --countdown }),
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
    }, [visible, onExit, t, isRemoteLogin]);

    return null;
};
