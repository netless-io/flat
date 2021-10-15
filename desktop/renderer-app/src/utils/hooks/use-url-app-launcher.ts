import { useContext } from "react";
import { GlobalStoreContext, URLProtocolStoreContext } from "../../components/StoreProvider";
import { joinRoomHandler } from "../../pages/utils/join-room-handler";
import { useAutoRun } from "../mobx";
import { usePushHistory, RouteNameType, RouteParams } from "../routes";
import { matchPath, useLocation } from "react-router-dom";
import { ClassRouteName, routeConfig } from "../../route-config";

/**
 * Listen to UrlProtocolStore toJoinRoomUUID value that to join room.
 * Jump to login page if user is not logged in.
 */
export function useURLAppLauncher(): void {
    const urlProtocolStore = useContext(URLProtocolStoreContext);
    const globalStore = useContext(GlobalStoreContext);
    const pushHistory = usePushHistory();
    const location = useLocation();

    const inClassRoom = (): { roomUUID: string } | null => {
        const classPages: ClassRouteName[] = [
            RouteNameType.SmallClassPage,
            RouteNameType.OneToOnePage,
            RouteNameType.BigClassPage,
        ];

        for (const name of classPages) {
            const result = matchPath<RouteParams<ClassRouteName>>(
                location.pathname,
                routeConfig[name].path,
            );

            if (result) {
                return result.params;
            }
        }

        return null;
    };

    useAutoRun(() => {
        if (!urlProtocolStore.toJoinRoomUUID) {
            return;
        }

        if (!globalStore.userUUID) {
            pushHistory(RouteNameType.LoginPage, {});
            return;
        }

        if (inClassRoom()?.roomUUID !== urlProtocolStore.toJoinRoomUUID) {
            void joinRoomHandler(urlProtocolStore.toJoinRoomUUID, pushHistory);
        }

        urlProtocolStore.clearToJoinRoomUUID();
    });
}
