import { RoomType } from "@netless/flat-server-api";
import { ClassroomReplayStore } from "@netless/flat-stores";
import { errorTips, useSafePromise } from "flat-components";
import { useEffect, useState } from "react";
import { RouteNameType } from "../route-config";
import { usePushHistory } from "./routes";

export interface UseClassroomReplayStoreConfig {
    roomUUID: string;
    ownerUUID: string;
    roomType: RoomType;
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
        const classroomReplayStore = new ClassroomReplayStore(config);
        // TODO: add whiteboard service
        // const flatServices = FlatServices.getInstance();

        setClassroomReplayStore(classroomReplayStore);
        sp(classroomReplayStore.init()).catch(e => {
            errorTips(e);
            pushHistory(RouteNameType.HomePage);
        });

        return () => {
            classroomReplayStore?.destroy().catch(e => {
                if (process.env.NODE_ENV !== "production") {
                    console.error(e);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return classroomReplayStore;
}
