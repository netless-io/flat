import "video.js/dist/video-js.min.css";
import "./ReplayPage.less";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useContext, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";

import { RoomType } from "@netless/flat-server-api";
import { LoadingPage, TopBar } from "flat-components";

import ChatPanelReplay from "../components/ChatPanelReplay";
import RealtimePanel from "../components/RealtimePanel";
import { useClassroomReplayStore } from "../utils/use-classroom-replay-store";
import { useLoginCheck } from "../utils/use-login-check";
import { ReplayList } from "./ReplayList";
import { ReplayVideo } from "./ReplayVideo";
import { ReplayWhiteboard } from "./ReplayWhiteboard";
import ExitReplayConfirm from "../components/ExitReplayConfirm";
import { WindowsSystemBtnContext } from "../components/StoreProvider";

export type ReplayPageProps = RouteComponentProps<{
    roomUUID: string;
    ownerUUID: string;
    roomType: RoomType;
}>;

export const ReplayPage = observer<ReplayPageProps>(function ReplayPage({ match }) {
    useLoginCheck();

    const history = useHistory();
    const classroomReplayStore = useClassroomReplayStore(match.params);
    const [showExitReplayModal, setShowExitReplayModal] = useState(false);

    const windowsBtn = useContext(WindowsSystemBtnContext);

    if (!classroomReplayStore) {
        return <LoadingPage />;
    }

    const exitConfirm = (): void => {
        history.goBack();
    };

    const isSmallClass = classroomReplayStore.roomType === RoomType.SmallClass;

    const ReplayVideos = (
        <div className={classNames("replay-videos", { "is-horizontal": isSmallClass })}>
            <ReplayVideo
                classroomReplayStore={classroomReplayStore}
                small={isSmallClass}
                user={classroomReplayStore.users.creator}
            />
            {classroomReplayStore.onStageUserUUIDs.map(uuid => (
                <ReplayVideo
                    key={uuid}
                    classroomReplayStore={classroomReplayStore}
                    small={isSmallClass}
                    user={classroomReplayStore.users.cachedUsers.get(uuid)}
                    video={classroomReplayStore.userVideos.get(uuid)}
                />
            ))}
        </div>
    );

    return (
        <div className="replay-container">
            {isSmallClass && ReplayVideos}
            {windowsBtn && (
                <TopBar
                    showWindowsSystemBtn={windowsBtn.showWindowsBtn}
                    onClickWindowsSystemBtn={windowsBtn.onClickWindowsSystemBtn}
                    onDoubleClick={windowsBtn.clickWindowMaximize}
                />
            )}
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
            <ExitReplayConfirm
                visible={showExitReplayModal}
                onCancel={() => setShowExitReplayModal(false)}
                onConfirm={exitConfirm}
                onSendWindowWillClose={() => setShowExitReplayModal(true)}
            />
        </div>
    );
});

export default ReplayPage;
