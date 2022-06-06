import { RouteNameType, usePushHistory } from "../../utils/routes";
import { roomStore } from "../../stores/room-store";
import { RoomType } from "../../api-middleware/flatServer/constants";
import { errorTips } from "../../components/Tips/ErrorTips";
import { globalStore } from "../../stores/global-store";

export const joinRoomHandler = async (
    roomUUID: string,
    pushHistory: ReturnType<typeof usePushHistory>,
): Promise<void> => {
    try {
        const formatRoomUUID = roomUUID.replace(/\s+/g, "");
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
    } catch (e) {
        pushHistory(RouteNameType.HomePage);
        errorTips(e);
    }
};
