import "video.js/dist/video-js.min.css";
import "./ReplayPage.less";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React from "react";
import { RouteComponentProps } from "react-router-dom";

import { RoomType } from "@netless/flat-server-api";
import { LoadingPage } from "flat-components";

import ChatPanelReplay from "../components/ChatPanelReplay";
import RealtimePanel from "../components/RealtimePanel";
import { useClassroomReplayStore } from "../utils/use-classroom-replay-store";
import { useLoginCheck } from "../utils/use-login-check";
import { ReplayList } from "./ReplayList";
import { ReplayVideo } from "./ReplayVideo";
import { ReplayWhiteboard } from "./ReplayWhiteboard";

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

    const isSmallClass = classroomReplayStore.roomType === RoomType.SmallClass;

    const ReplayVideos = (
        <div className={classNames("replay-videos", { "is-horizontal": isSmallClass })}>
            <ReplayVideo
                classroomReplayStore={classroomReplayStore}
                user={classroomReplayStore.users.creator}
            />
            {classroomReplayStore.onStageUserUUIDs.map(uuid => (
                <ReplayVideo
                    key={uuid}
                    classroomReplayStore={classroomReplayStore}
                    video={classroomReplayStore.userVideos.get(uuid)}
                />
            ))}
        </div>
    );

    return (
        <div className="replay-container">
            {isSmallClass && ReplayVideos}
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
                    videoSlot={!isSmallClass && ReplayVideos}
                />
            </div>
        </div>
    );
});

export default ReplayPage;
