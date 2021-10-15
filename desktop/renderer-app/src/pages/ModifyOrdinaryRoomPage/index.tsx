import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { OrdinaryRoomForm } from "./OrdinaryRoomForm";
import { PeriodicSubRoomForm } from "./PeriodicSubRoomForm";
import { useWindowSize } from "../../utils/hooks/use-window-size";

type ModifyOrdinaryRoomPageProps = {
    roomUUID: string;
    periodicUUID?: string;
};

export const ModifyOrdinaryRoomPage = observer<ModifyOrdinaryRoomPageProps>(
    function ModifyOrdinaryRoomPage() {
        useWindowSize("Main");

        const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();
        if (periodicUUID) {
            return <PeriodicSubRoomForm roomUUID={roomUUID} periodicUUID={periodicUUID} />;
        } else {
            return <OrdinaryRoomForm roomUUID={roomUUID} />;
        }
    },
);
