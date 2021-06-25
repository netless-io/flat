import { useContext, useEffect } from "react";
import { matchPath, useHistory, useLocation } from "react-router-dom";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { joinRoomHandler } from "../../pages/utils/joinRoomHandler";
import { routeConfig } from "../../route-config";
import { ipcReceive, ipcReceiveRemove } from "../ipc";
import { usePushHistory, RouteNameType } from "../routes";
/**
 * Listen to ipc for join room request(e.g. from URL app launches).
 * Jump to login page if user is not logged in.
 */
export function useURLAppLauncher(): void {
    const globalStore = useContext(GlobalStoreContext);
    const pushHistory = usePushHistory();
    const history = useHistory();
    const location = useLocation<{ roomUUID: string }>();

    useEffect(() => {
        ipcReceive("request-join-room", ({ roomUUID }) => {
            if (globalStore.userUUID) {
                void joinRoomHandler(roomUUID, pushHistory);
            } else {
                if (matchPath(routeConfig[RouteNameType.LoginPage].path, location.pathname)) {
                    history.location.state = roomUUID;
                } else {
                    pushHistory(RouteNameType.LoginPage, {}, roomUUID);
                }
            }
        });

        return () => {
            ipcReceiveRemove("request-join-room");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
