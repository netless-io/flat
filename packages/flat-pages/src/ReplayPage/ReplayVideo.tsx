import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef } from "react";
import { ClassroomReplayStore, User } from "@netless/flat-stores";
import { VideoAvatar } from "flat-components";
import { noop } from "lodash-es";
import classNames from "classnames";

export interface ReplayVideoProps {
    classroomReplayStore: ClassroomReplayStore;
    user?: User | null | undefined;
    video?: HTMLVideoElement | undefined;
    small?: boolean;
}

export const ReplayVideo = observer<ReplayVideoProps>(function ReplayVideo({
    classroomReplayStore,
    user,
    video: realVideo,
    small,
}) {
    const ref = useRef<HTMLDivElement>(null);
    const video = useMemo(
        () => realVideo || (user && classroomReplayStore.userVideos.get(user.userUUID)),
        [classroomReplayStore.userVideos, user, realVideo],
    );
    const camera = user && classroomReplayStore.userDevices.get(user.userUUID)?.camera;

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

    return user ? (
        <VideoAvatar
            avatarUser={user}
            isCreator={false}
            small={small}
            updateDeviceState={noop}
            userUUID={user?.userUUID}
        >
            <div
                ref={ref}
                className={classNames("replay-video", {
                    "is-active": camera,
                })}
            />
        </VideoAvatar>
    ) : null;
});
