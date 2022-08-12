import { ClassroomStore, ClassroomStoreConfig } from "@netless/flat-stores";
import { useEffect, useState } from "react";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { errorTips, useSafePromise } from "flat-components";
import { useFlatService } from "../components/FlatServicesContext";
import { FlatServices } from "@netless/flat-services";

export type useClassRoomStoreConfig = Omit<ClassroomStoreConfig, "rtc" | "rtm" | "whiteboard">;

export function useClassroomStore(config: useClassRoomStoreConfig): ClassroomStore | undefined {
    const rtc = useFlatService("videoChat");
    const rtm = useFlatService("textChat");
    const whiteboard = useFlatService("whiteboard");
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
        if (rtc && rtm && whiteboard) {
            const classroomStore = new ClassroomStore({
                ...config,
                rtc,
                rtm,
                whiteboard,
            });
            setClassroomStore(classroomStore);
            sp(classroomStore.init()).catch(e => {
                errorTips(e);
                pushHistory(RouteNameType.HomePage);
            });
            return () => {
                classroomStore.destroy();
                const flatServices = FlatServices.getInstance();
                flatServices.shutdownService("videoChat");
                flatServices.shutdownService("textChat");
                flatServices.shutdownService("textChat");
            };
        }
        return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rtc, rtm, whiteboard]);

    return classroomStore;
}
