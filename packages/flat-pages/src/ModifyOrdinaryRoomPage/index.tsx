import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";
import { RouteNameType, RouteParams } from "../utils/routes";
import { useLoginCheck } from "../utils/use-login-check";
import { OrdinaryRoomForm } from "./OrdinaryRoomForm";
import { PeriodicSubRoomForm } from "./PeriodicSubRoomForm";

type ModifyOrdinaryRoomPageProps = {
    roomUUID: string;
    periodicUUID?: string;
};

export const ModifyOrdinaryRoomPage = observer<ModifyOrdinaryRoomPageProps>(
    function ModifyOrdinaryRoomPage() {
        useLoginCheck();

        const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();
        if (periodicUUID) {
            return <PeriodicSubRoomForm periodicUUID={periodicUUID} roomUUID={roomUUID} />;
        } else {
            return <OrdinaryRoomForm roomUUID={roomUUID} />;
        }
    },
);

export default ModifyOrdinaryRoomPage;
