import React, { useContext, useMemo } from "react";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { useLanguage, useTranslate } from "@netless/flat-i18n";
import { GlobalStoreContext } from "./StoreProvider";

export interface RoomNotBeginModalProps {}

export const RoomNotBeginModal = observer<RoomNotBeginModalProps>(function RoomNotBeginModal({}) {
    const t = useTranslate();
    const lang = useLanguage();
    const globalStore = useContext(GlobalStoreContext);

    const title = useMemo((): string => {
        const { title, ownerName } = globalStore.roomNotBegin || {};
        return title || (ownerName && t("create-room-default-title", { name: ownerName })) || "";
    }, [globalStore.roomNotBegin]);

    const joinEarly = globalStore.serverRegionConfig?.server.joinEarly || 5;
    const closeModal = (): void => globalStore.updateRoomNotBegin(null);

    return (
        <Modal
            centered
            className="room-not-begin-modal"
            footer={[
                <Button key="confirm" type="primary" onClick={closeModal}>
                    {t("confirm")}
                </Button>,
            ]}
            open={!!globalStore.roomNotBegin}
            title={[
                t("room-not-begin-title-pre"),
                <em key="room-not-begin-minutes" className="room-not-begin-early-minutes">
                    {t("minutes", { minutes: joinEarly })}
                </em>,
                t("room-not-begin-title-post"),
            ]}
            width={400}
            onCancel={closeModal}
            onOk={closeModal}
        >
            <strong>{title}</strong>
            {!title && lang === "en" ? "It " : " "}
            {t("room-has-been-added")}
        </Modal>
    );
});
