import React, { useCallback, useContext, useEffect } from "react";
import { message } from "antd";
import { clipboard } from "electron";
import { InviteModal as InviteModalImpl } from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { FLAT_WEB_BASE_URL } from "../../constants/process";
import { RoomItem } from "../../stores/room-store";
import { GlobalStoreContext, RoomStoreContext } from "../StoreProvider";
import { errorTips } from "../Tips/ErrorTips";
import "./InviteModal.less";

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
        (text: string): void => {
            clipboard.writeText(text);
            void message.success(t("copy-success"));
            onCopied();
        },
        [onCopied, t],
    );

    return (
        <InviteModalImpl
            baseUrl={FLAT_WEB_BASE_URL}
            periodicWeeks={periodicInfo?.periodic.weeks}
            room={room}
            userName={globalStore.userName ?? ""}
            visible={visible}
            onCancel={onCancel}
            onCopy={onCopy}
        />
    );
});
