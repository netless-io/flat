import React, { useCallback, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { InviteModal as InviteModalImpl, errorTips } from "flat-components";
import { useTranslation } from "react-i18next";
import { RoomItem } from "@netless/flat-stores";
import { GlobalStoreContext, RoomStoreContext } from "../StoreProvider";
import { FLAT_SERVER_BASE_URL } from "@netless/flat-server-api";

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
            baseUrl={FLAT_SERVER_BASE_URL}
            periodicWeeks={periodicInfo?.periodic.weeks}
            room={room}
            userName={globalStore.userName ?? ""}
            visible={visible}
            onCancel={onCancel}
            onCopy={onCopy}
        />
    );
});
