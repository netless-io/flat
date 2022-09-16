import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef } from "react";
import { ClassroomReplayStore, User } from "@netless/flat-stores";

export interface ReplayVideoProps {
    classroomReplayStore: ClassroomReplayStore;
    user?: User | null | undefined;
    video?: HTMLVideoElement | undefined;
}

export const ReplayVideo = observer<ReplayVideoProps>(function ReplayVideo({
    classroomReplayStore,
    user,
    video: realVideo,
}) {
    const ref = useRef<HTMLDivElement>(null);
    const video = useMemo(
        () => realVideo || (user && classroomReplayStore.userVideos.get(user.userUUID)),
        [classroomReplayStore.userVideos, user, realVideo],
    );

    useEffect(() => {
        if (ref.current) {
            while (ref.current.firstChild) {
                ref.current.removeChild(ref.current.lastChild!);
            }
            if (video) {
                ref.current.appendChild(video);
            }
        }
    }, [video]);

    return <div ref={ref} className="replay-video" />;
});
