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
        const data = await roomStore.joinRoom(formatRoomUUID);
        globalStore.updateShowGuide(data.showGuide);
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
