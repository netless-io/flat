import { ClassroomReplayStore, ClassroomReplayStoreConfig } from "@netless/flat-stores";
import { useState } from "react";
import { useAutoRun } from "../utils/mobx";

export type UseClassroomReplayStoreConfig = ClassroomReplayStoreConfig;

export function useClassroomReplayStore(
    config: UseClassroomReplayStoreConfig,
): ClassroomReplayStore {
    const [classroomReplayStore] = useState(() => new ClassroomReplayStore(config));

    useAutoRun(() => {
        const title = classroomReplayStore.roomInfo?.title;
        if (title) {
            document.title = title;
        }
    });

    return classroomReplayStore;
}
