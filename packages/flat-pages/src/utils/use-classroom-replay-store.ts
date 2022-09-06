import { FlatServices } from "@netless/flat-services";
import { ClassroomReplayStore } from "@netless/flat-stores";
import { errorTips, useSafePromise } from "flat-components";
import { useEffect, useState } from "react";
import { RouteNameType } from "../route-config";
import { usePushHistory } from "./routes";

export interface UseClassroomReplayStoreConfig {
    roomUUID: string;
    ownerUUID: string;
}

export function useClassroomReplayStore(
    config: UseClassroomReplayStoreConfig,
): ClassroomReplayStore | undefined {
    const sp = useSafePromise();
    const pushHistory = usePushHistory();
    const [classroomReplayStore, setClassroomReplayStore] = useState<ClassroomReplayStore>();

    const title = classroomReplayStore?.roomInfo?.title;
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    useEffect(() => {
        let isUnmounted = false;
        let classroomReplayStore: ClassroomReplayStore | undefined;
        const flatServices = FlatServices.getInstance();

        sp(
            Promise.all([
                // TODO: add whiteboard service
                flatServices.requestService("textChat"),
            ]),
        ).then(([textChat]) => {
            if (!isUnmounted && textChat) {
                classroomReplayStore = new ClassroomReplayStore({
                    ...config,
                    rtm: textChat,
                });
                setClassroomReplayStore(classroomReplayStore);
                sp(classroomReplayStore.init()).catch(e => {
                    errorTips(e);
                    pushHistory(RouteNameType.HomePage);
                });
            }
        });

        return () => {
            isUnmounted = true;
            classroomReplayStore?.destroy().catch(e => {
                if (process.env.NODE_ENV !== "production") {
                    console.error(e);
                }
            });
            // TODO: add whiteboard service
            flatServices.shutdownService("textChat");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return classroomReplayStore;
}
