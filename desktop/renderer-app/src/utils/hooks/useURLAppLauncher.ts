import { useContext } from "react";
import { GlobalStoreContext, URLProtocolStoreContext } from "../../components/StoreProvider";
import { joinRoomHandler } from "../../pages/utils/joinRoomHandler";
import { useAutoRun } from "../mobx";
import { usePushHistory, RouteNameType } from "../routes";
/**
 * Listen to UrlProtocolStore toJoinRoomUUID value that to join room.
 * Jump to login page if user is not logged in.
 */
export function useURLAppLauncher(): void {
    const urlProtocolStore = useContext(URLProtocolStoreContext);
    const globalStore = useContext(GlobalStoreContext);
    const pushHistory = usePushHistory();

    useAutoRun(() => {
        if (globalStore.userUUID) {
            if (urlProtocolStore.toJoinRoomUUID) {
                void joinRoomHandler(urlProtocolStore.toJoinRoomUUID, pushHistory);
                urlProtocolStore.clearToJoinRoomUUID();
            }
        } else {
            pushHistory(RouteNameType.LoginPage, {}, urlProtocolStore.toJoinRoomUUID);
        }
    });
}
