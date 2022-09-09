import "video.js/dist/video-js.min.css";
import "./ReplayPage.less";

import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";

import { RoomType } from "@netless/flat-server-api";
import { LoadingPage } from "flat-components";

import { useClassroomReplayStore } from "../utils/use-classroom-replay-store";
import { useLoginCheck } from "../utils/use-login-check";
import { ReplayList } from "./ReplayList";
import { ReplayWhiteboard } from "./ReplayWhiteboard";
import { ClassroomReplayStore, User } from "@netless/flat-stores";
import RealtimePanel from "../components/RealtimePanel";
import ChatPanelReplay from "../components/ChatPanelReplay";
import classNames from "classnames";

export type ReplayPageProps = RouteComponentProps<{
    roomUUID: string;
    ownerUUID: string;
    roomType: RoomType;
}>;

export const ReplayPage = observer<ReplayPageProps>(function ReplayPage({ match }) {
    useLoginCheck();

    const classroomReplayStore = useClassroomReplayStore(match.params);

    if (!classroomReplayStore) {
        return <LoadingPage />;
    }

    return (
        <div className="replay-container">
            <div className="replay-content">
                <div className="replay-left">
                    <ReplayWhiteboard classroomReplayStore={classroomReplayStore} />
                    <div className="replay-share-screen">{/* TODO */}</div>
                    <div
                        className={classNames("replay-bottom", {
                            "is-playing": classroomReplayStore.isPlaying,
                        })}
                    >
                        <ReplayList classroomReplayStore={classroomReplayStore} />
                    </div>
                </div>
                <RealtimePanel
                    isShow
                    isVideoOn
                    chatSlot={<ChatPanelReplay classRoomReplayStore={classroomReplayStore} />}
                    videoSlot={
                        <div className="replay-videos">
                            <ReplayVideo
                                classroomReplayStore={classroomReplayStore}
                                user={classroomReplayStore.users.creator}
                            />
                            {classroomReplayStore.onStageUserUUIDs.map(uuid => (
                                <ReplayVideo
                                    key={uuid}
                                    classroomReplayStore={classroomReplayStore}
                                    user={classroomReplayStore.users.cachedUsers.get(uuid)}
                                />
                            ))}
                        </div>
                    }
                />
            </div>
        </div>
    );
});

export default ReplayPage;

export interface ReplayVideoProps {
    classroomReplayStore: ClassroomReplayStore;
    user: User | null | undefined;
}

const ReplayVideo = observer<ReplayVideoProps>(function ReplayVideo({
    classroomReplayStore,
    user,
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            while (ref.current.firstChild) {
                ref.current.removeChild(ref.current.lastChild!);
            }
            if (user) {
                const video = classroomReplayStore.userVideos.get(user.userUUID);
                if (video) {
                    ref.current.appendChild(video);
                }
            }
        }
    }, [classroomReplayStore.userVideos, user]);

    return <div ref={ref} className="replay-video" />;
});
