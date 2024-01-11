import { RoomStoppedModal } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { RoomStatus } from "@netless/flat-server-api";
import { RouteNameType, usePushHistory } from "../../utils/routes";

export interface RoomStatusStoppedModalProps {
    isRemoteLogin: boolean;
    isExitConfirmModalVisible: boolean;
    roomStatus: RoomStatus;
}

/**
 * Show an info modal on joiner side when room status becomes stopped
 */
export const RoomStatusStoppedModal = observer<RoomStatusStoppedModalProps>(
    function RoomStatusStoppedModal({ isRemoteLogin, isExitConfirmModalVisible, roomStatus }) {
        const pushHistory = usePushHistory();

        const onExit = useCallback(() => {
            pushHistory(RouteNameType.HomePage);
        }, [pushHistory]);

        return (
            <RoomStoppedModal
                isExitConfirmModalVisible={isExitConfirmModalVisible}
                isRemoteLogin={isRemoteLogin}
                roomStatus={roomStatus}
                onExit={onExit}
            />
        );
    },
);

export default RoomStatusStoppedModal;
