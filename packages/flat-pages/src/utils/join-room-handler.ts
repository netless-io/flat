import { RouteNameType } from "../utils/routes";
import { roomStore, globalStore } from "@netless/flat-stores";
import { RequestErrorCode, RoomType, ServerRequestError } from "@netless/flat-server-api";
import { errorTips, message } from "flat-components";
import { FlatI18n } from "@netless/flat-i18n";

export const joinRoomHandler = async (
    roomUUID: string,
    // The 'pushHistory()' signature is different in electron and in web.
    // Use 'any' here since we only use the same part between them.
    pushHistory: (routeName: any, data?: any) => void,
): Promise<void> => {
    const formatRoomUUID = roomUUID.replace(/\s+/g, "");

    try {
        const roomInfo = roomStore.rooms.get(formatRoomUUID);
        const periodicUUID = roomInfo?.periodicUUID;
        if (formatRoomUUID.length < 32) {
            roomStore.rememberNextRoom(formatRoomUUID);
        }

        const data = await roomStore.joinRoom(periodicUUID || formatRoomUUID);
        globalStore.updateShowGuide(data.showGuide);
        globalStore.updatePeriodicUUID(roomInfo?.periodicUUID);

        switch (data.roomType) {
            case RoomType.BigClass: {
                pushHistory(RouteNameType.BigClassPage, data);
                break;
            }
            case RoomType.SmallClass: {
                pushHistory(RouteNameType.SmallClassPage, data);
                break;
            }
            case RoomType.OneToOne: {
                pushHistory(RouteNameType.OneToOnePage, data);
                break;
            }
            default: {
                new Error("failed to join room: incorrect room type");
            }
        }

        if (data.billing && data.billing.vipLevel === 0) {
            void message.info(
                FlatI18n.t("time-limit-tip", {
                    roomType: FlatI18n.t("vip-level." + data.billing.vipLevel),
                    minutes: data.billing.limit,
                }),
            );
        }
    } catch (e) {
        // if room not found and is pmi room, show wait for teacher to enter
        if (e.message.includes(RequestErrorCode.RoomNotFoundAndIsPmi)) {
            void message.info(FlatI18n.t("wait-for-teacher-to-enter"));
            return;
        }

        // if room not started, show different message according to owner
        if (e.errorCode === RequestErrorCode.RoomNotBegin && e.detail) {
            const { title, ownerUUID, ownerName } = e.detail as {
                title: string;
                uuid: string;
                beginTime: number;
                ownerUUID: string;
                ownerName?: string;
            };
            if (globalStore.userUUID === ownerUUID) {
                (e as ServerRequestError).errorMessage = "your-room-is-not-started-yet";
                // show it in error tips
            } else {
                pushHistory(RouteNameType.HomePage);
                // show the modal
                globalStore.updateRoomNotBegin({ title, ownerName });
                return;
            }
        }

        pushHistory(RouteNameType.HomePage);
        errorTips(e);
    }
};
