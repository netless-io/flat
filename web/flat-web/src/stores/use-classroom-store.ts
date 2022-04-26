import { ClassroomStore, ClassroomStoreConfig } from "@netless/flat-stores";
import { useEffect, useState } from "react";
import { getFlatRTC } from "../services/flat-rtc";
import { getFlatRTM } from "../services/flat-rtm";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { errorTips, useSafePromise } from "flat-components";
import { useAutoRun } from "../utils/mobx";

export type useClassRoomStoreConfig = Omit<ClassroomStoreConfig, "rtc" | "rtm">;

export function useClassroomStore(config: useClassRoomStoreConfig): ClassroomStore {
    const [classRoomStore] = useState(
        () =>
            new ClassroomStore({
                ...config,
                rtc: getFlatRTC(),
                rtm: getFlatRTM(),
            }),
    );

    const pushHistory = usePushHistory();
    const sp = useSafePromise();

    useAutoRun(() => {
        const title = classRoomStore.roomInfo?.title;
        if (title) {
            document.title = title;
        }
    });

    useEffect(() => {
        sp(classRoomStore.init()).catch(e => {
            errorTips(e);
            pushHistory(RouteNameType.HomePage);
        });
        return () => {
            void classRoomStore.destroy();
        };
        // run only on component mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return classRoomStore;
}
