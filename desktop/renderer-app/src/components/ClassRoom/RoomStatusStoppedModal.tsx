import { RoomStoppedModal } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
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
        const pushHistory = usePushHistory();

        const onExit = useCallback(() => {
            pushHistory(RouteNameType.HomePage);
        }, [pushHistory]);

        return <RoomStoppedModal isCreator={isCreator} roomStatus={roomStatus} onExit={onExit} />;
    },
);

export default RoomStatusStoppedModal;
