import "./InviteModal.less";

import React, { useCallback, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { InviteModal as InviteModalImpl } from "flat-components";
import { useTranslation } from "react-i18next";
import { RoomItem } from "../../stores/room-store";
import { GlobalStoreContext, RoomStoreContext } from "../StoreProvider";
import { errorTips } from "../Tips/ErrorTips";
import { FLAT_WEB_BASE_URL } from "../../constants/process";

export interface InviteModalProps {
    visible: boolean;
    room: RoomItem;
    // after copy is performed
    onCopied: () => void;
    onCancel: () => void;
}

export const InviteModal = observer<InviteModalProps>(function InviteModal({
    visible,
    room,
    onCopied,
    onCancel,
}) {
    const { t } = useTranslation();
    const globalStore = useContext(GlobalStoreContext);
    const roomStore = useContext(RoomStoreContext);

    const { periodicUUID } = room;
    const periodicInfo = periodicUUID ? roomStore.periodicRooms.get(periodicUUID) : undefined;

    useEffect(() => {
        if (periodicUUID) {
            roomStore.syncPeriodicRoomInfo(periodicUUID).catch(errorTips);
        }
    }, [periodicUUID, roomStore]);

    const onCopy = useCallback(
        async (text: string): Promise<void> => {
            await navigator.clipboard.writeText(text);
            void message.success(t("copy-success"));
            onCopied();
        },
        [onCopied, t],
    );

    return (
        <InviteModalImpl
            baseUrl={FLAT_WEB_BASE_URL}
            visible={visible}
            room={room}
            userName={globalStore.userName ?? ""}
            periodicWeeks={periodicInfo?.periodic.weeks}
            onCopy={onCopy}
            onCancel={onCancel}
        />
    );
});
