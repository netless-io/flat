import "./InviteModal.less";

import React, { useCallback, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { InviteModal as InviteModalImpl } from "flat-components";
import { useTranslation } from "react-i18next";
import { RoomItem } from "../../stores/RoomStore";
import { GlobalStoreContext, RoomStoreContext } from "../StoreProvider";
import { clipboard } from "electron";
import { errorTips } from "../Tips/ErrorTips";
import { INVITE_BASEURL } from "../../constants/Process";

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
        [onCopied],
    );

    return (
        <InviteModalImpl
            baseUrl={INVITE_BASEURL}
            visible={visible}
            room={room}
            userName={globalStore.userName ?? ""}
            periodicWeeks={periodicInfo?.periodic.weeks}
            onCopy={onCopy}
            onCancel={onCancel}
        />
    );
});
