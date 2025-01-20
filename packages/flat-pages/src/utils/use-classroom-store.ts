import { ClassroomStore, ClassroomStoreConfig } from "@netless/flat-stores";
import { useEffect, useState } from "react";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { errorTips, useSafePromise } from "flat-components";
import { FlatServices } from "@netless/flat-services";
import { RoomStatus } from "@netless/flat-server-api";

export type useClassRoomStoreConfig = Omit<
    ClassroomStoreConfig,
    "rtc" | "rtm" | "whiteboard" | "recording"
>;

export function useClassroomStore(config: useClassRoomStoreConfig): ClassroomStore | undefined {
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
        let isUnmounted = false;
        let classroomStore: ClassroomStore | undefined;
        const flatServices = FlatServices.getInstance();
        sp(
            Promise.all([
                flatServices.requestService("videoChat"),
                flatServices.requestService("whiteboard"),
                flatServices.requestService("recording"),
                flatServices.requestService("textChat"),
            ]),
        ).then(([videoChat, whiteboard, recording, textChat]) => {
            if (!isUnmounted && videoChat && whiteboard && recording && textChat) {
                const classroomStoreConfig: ClassroomStoreConfig = {
                    ...config,
                    rtc: videoChat,
                    whiteboard,
                    recording,
                    rtm: textChat,
                };
                classroomStore = new ClassroomStore(classroomStoreConfig);
                setClassroomStore(classroomStore);
                sp(classroomStore.init()).catch(e => {
                    errorTips(e);
                    pushHistory(RouteNameType.HomePage);
                });
            }
        });

        return () => {
            isUnmounted = true;
            classroomStore?.destroy().catch(e => {
                if (process.env.NODE_ENV !== "production") {
                    console.error(e);
                }
            });
            flatServices.shutdownService("videoChat");
            flatServices.shutdownService("textChat");
            flatServices.shutdownService("whiteboard");
            flatServices.shutdownService("recording");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (classroomStore) {
            const phase = classroomStore.whiteboardStore.phase;
            const roomState = classroomStore.roomStatus;
            if (phase === "disconnected" && roomState === RoomStatus.Stopped) {
                pushHistory(RouteNameType.HomePage);
            }
        }
    }, [classroomStore?.whiteboardStore.phase, classroomStore?.roomStatus]);
    return classroomStore;
}
