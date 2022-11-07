import { ClassroomReplayStore } from "@netless/flat-stores";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";

export interface ReplayVideoProps {
    classroomReplayStore: ClassroomReplayStore;
}

export const ReplayVideo = observer<ReplayVideoProps>(function ReplayVideo({
    classroomReplayStore,
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            if (ref.current.firstChild) {
                ref.current.removeChild(ref.current.firstChild);
            }
            if (classroomReplayStore.video) {
                ref.current.appendChild(classroomReplayStore.video);
            }
        }
    }, [classroomReplayStore.video]);

    return <div ref={ref} className="replay-video" />;
});
