import { RequestErrorCode, RoomType } from "@netless/flat-server-api";
import { roomStore, globalStore } from "@netless/flat-stores";
import { errorTips, message } from "flat-components";
import { FlatI18n } from "@netless/flat-i18n";
import { RouteNameType } from "../../route-config";
import { usePushHistory } from "../../utils/routes";

export const joinRoomHandler = async (
    roomUUID: string,
    pushHistory: ReturnType<typeof usePushHistory>,
): Promise<void> => {
    const formatRoomUUID = roomUUID.replace(/\s+/g, "");

    try {
        const roomInfo = roomStore.rooms.get(formatRoomUUID);
        const periodicUUID = roomInfo?.periodicUUID;
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
        pushHistory(RouteNameType.HomePage);
        errorTips(e);
    }
};
