import { FC, useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import { RoomStatus } from "../../../types/room";

export interface RoomStoppedModalProps {
    isCreator: boolean;
    isRemoteLogin: boolean;
    roomStatus: RoomStatus;
    onExit: () => void;
}

/**
 * Show an info modal on joiner side when room status becomes stopped.
 *
 * **Note**: be sure to use `useCallback` when passing the `onExit` prop.
 */
export const RoomStoppedModal: FC<RoomStoppedModalProps> = ({
    isCreator,
    isRemoteLogin,
    roomStatus,
    onExit,
}) => {
    const modalRef = useRef<ReturnType<typeof Modal.info>>();
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (isRemoteLogin) {
            setVisible(true);
        }
    }, [isRemoteLogin]);

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
