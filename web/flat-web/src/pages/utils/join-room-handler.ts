import { generateRoutePath, RouteNameType, usePushHistory } from "../../utils/routes";
import { roomStore, globalStore } from "@netless/flat-stores";
import { RoomType } from "@netless/flat-server-api";
import { errorTips } from "flat-components";

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
        // try to work around chrome does not show permission popup after
        // soft navigating. here we do a "hard" navigating instead.
        switch (data.roomType) {
            case RoomType.BigClass: {
                // pushHistory(RouteNameType.BigClassPage, data);
                window.location.href = generateRoutePath(RouteNameType.BigClassPage, data);
                break;
            }
            case RoomType.SmallClass: {
                // pushHistory(RouteNameType.SmallClassPage, data);
                window.location.href = generateRoutePath(RouteNameType.SmallClassPage, data);
                break;
            }
            case RoomType.OneToOne: {
                // pushHistory(RouteNameType.OneToOnePage, data);
                window.location.href = generateRoutePath(RouteNameType.OneToOnePage, data);
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
