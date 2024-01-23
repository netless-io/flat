import React, { useContext, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { RoomStoreContext, GlobalStoreContext } from "./StoreProvider";
import { useLanguage, useTranslate } from "@netless/flat-i18n";

export interface RoomNotBeginModalProps {}

export const RoomNotBeginModal = observer<RoomNotBeginModalProps>(function RoomNotBeginModal({}) {
    const t = useTranslate();
    const lang = useLanguage();
    const [title, setTitle] = useState("");
    const [open, setOpen] = useState(false);
    const roomStore = useContext(RoomStoreContext);
    const globalStore = useContext(GlobalStoreContext);
    const uuid = globalStore.roomNotBeginRoomUUID;
    const joinEarly = globalStore.serverRegionConfig?.server.joinEarly || 5;

    const closeModal = (): void => setOpen(false);

    useEffect(() => {
        if (!open && uuid && roomStore.rooms.has(uuid)) {
            const { title, ownerName } = roomStore.rooms.get(uuid)!;
            if (title) {
                setTitle(title);
            } else if (ownerName) {
                setTitle(t("create-room-default-title", { name: ownerName }));
            } else {
                setTitle("");
            }
            setOpen(true);
            globalStore.updateRoomNotBeginRoomUUID(null);
        }
    }, [uuid, roomStore]);

    return (
        <Modal
            className="room-not-begin-modal"
            footer={[
                <Button key="confirm" type="primary" onClick={closeModal}>
                    {t("confirm")}
                </Button>,
            ]}
            open={open}
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
