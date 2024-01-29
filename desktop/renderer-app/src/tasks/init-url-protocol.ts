import { ipcReceive } from "../utils/ipc";
import { urlProtocolStore } from "../stores/url-protocol-store";

const requestJoinRoom = (): void => {
    ipcReceive("request-join-room", ({ roomUUID }) => {
        urlProtocolStore.updateToJoinRoomUUID(roomUUID);
    });
};

const requestReplayRoom = (): void => {
    ipcReceive("request-replay-room", ({ roomUUID, ownerUUID, roomType }) => {
        urlProtocolStore.updateToReplayRoom(roomUUID, ownerUUID, roomType);
    });
};

export const initURLProtocol = (): void => {
    requestJoinRoom();
    requestReplayRoom();
};
