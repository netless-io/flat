import { ClassroomStore, ClassroomStoreConfig } from "@netless/flat-stores";
import { useEffect, useState } from "react";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { errorTips, useSafePromise } from "flat-components";
import { useFlatService } from "../components/FlatServicesContext";

export type useClassRoomStoreConfig = Omit<ClassroomStoreConfig, "rtc" | "rtm">;

export function useClassroomStore(config: useClassRoomStoreConfig): ClassroomStore | undefined {
    const rtc = useFlatService("videoChat");
    const rtm = useFlatService("rtm");
    const [classroomStore, setClassroomStore] = useState<ClassroomStore>();

    const pushHistory = usePushHistory();
    const sp = useSafePromise();

    const title = classroomStore?.roomInfo?.title;
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    useEffect(() => {
        if (rtc && rtm) {
            const classroomStore = new ClassroomStore({
                ...config,
                rtc,
                rtm,
            });
            setClassroomStore(classroomStore);
            sp(classroomStore.init()).catch(e => {
                errorTips(e);
                pushHistory(RouteNameType.HomePage);
            });
            return () => {
                void classroomStore.destroy();
            };
        }
        return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rtc, rtm]);

    return classroomStore;
}
