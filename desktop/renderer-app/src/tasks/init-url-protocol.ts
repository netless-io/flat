import { configure } from "mobx";
import { urlProtocolStore } from "../stores/url-protocol-store";
import { ipcReceive } from "../utils/ipc";

configure({
    isolateGlobalState: true,
});

const requestJoinRoom = (): void => {
    ipcReceive("request-join-room", ({ roomUUID }) => {
        urlProtocolStore.updateToJoinRoomUUID(roomUUID);
    });
};

export const initURLProtocol = (): void => {
    requestJoinRoom();
};
