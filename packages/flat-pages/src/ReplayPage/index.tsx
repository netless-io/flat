import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps, useParams, useHistory } from "react-router-dom";
import { ErrorPage, LoadingPage, errorTips } from "flat-components";
import { RealtimePanel } from "../components/RealtimePanel";
import { ChatPanelReplay } from "../components/ChatPanelReplay";
import { OrdinaryRoomInfo, RoomType } from "@netless/flat-server-api";
import { observer } from "mobx-react-lite";
import { RouteNameType, RouteParams } from "../utils/routes";

import videoPlaySVG from "../../assets/image/video-play.svg";
import "video.js/dist/video-js.min.css";
import "./ReplayPage.less";
import { ExitReplayConfirmModal } from "../components/Modal/ExitReplayConfirmModal";
import { useLoginCheck } from "../utils/use-login-check";
import { useClassroomReplayStore } from "../utils/use-classroom-replay-store";

export type ReplayPageProps = RouteComponentProps<{
    roomUUID: string;
    ownerUUID: string;
}>;

export type ReplayPageState = {
    isReady: boolean;
    isPlaying: boolean;
    isShowController: boolean;
    hasError: boolean;

    isVisible: boolean;
    replayFail: boolean;
    replayState: boolean;
    withVideo: boolean;
    roomInfo: OrdinaryRoomInfo | null;
};

export const ReplayPage = observer<ReplayPageProps>(function ReplayPage() {
    useLoginCheck();

    const whiteboardElRef = useRef<HTMLDivElement>(null);
    const videoElRef = useRef<HTMLVideoElement>(null);
    const [showExitReplayModal, setShowExitReplayModal] = useState(false);
    const history = useHistory();

    const params = useParams<RouteParams<RouteNameType.ReplayPage>>();
    const classRoomReplayStore = useClassroomReplayStore(params);

    const [isShowController, setShowController] = useState(false);
    const hideControllerTimeoutRef = useRef<number>();
    const lastMouseRef = useRef({ lastMouseX: -100, lastMouseY: -100 });

    useEffect(() => {
        classRoomReplayStore.init().catch(errorTips);

        const handleSpaceKey = (evt: KeyboardEvent): void => {
            if (evt.key === "Space") {
                classRoomReplayStore.togglePlayPause();
            }
        };

        window.addEventListener("keydown", handleSpaceKey);

        return () => {
            classRoomReplayStore.destroy();
            window.removeEventListener("keydown", handleSpaceKey);
        };
    }, [classRoomReplayStore]);

    const exitConfirm = (): void => {
        history.goBack();
    };

    return (
        <div className="replay-container">
            {classRoomReplayStore.roomInfo?.roomType === RoomType.SmallClass &&
                renderSmallClassAvatars()}
            <div className="replay-content">
                {renderWhiteboard()}
                {renderRealtimePanel()}
            </div>
            {renderOverlay()}
            <ExitReplayConfirmModal
                visible={showExitReplayModal}
                onCancel={() => setShowExitReplayModal(false)}
                onConfirm={exitConfirm}
            />
        </div>
    );

    function renderSmallClassAvatars(): React.ReactElement {
        return (
            <div className="replay-small-class-avatars">
                <video ref={videoElRef} className="replay-small-class-avatars-video" />
            </div>
        );
    }

    function renderWhiteboard(): React.ReactElement {
        return (
            <div className="replay-whiteboard-wrap">
                <div
                    ref={whiteboardElRef}
                    className="replay-whiteboard"
                    onMouseMove={handleMouseMove}
                />
                {!classRoomReplayStore.isPlaying && (
                    <div
                        className="replay-play-overlay"
                        onClick={classRoomReplayStore.togglePlayPause}
                    >
                        <button className="replay-play-icon">
                            <img alt="play" src={videoPlaySVG} />
                        </button>
                    </div>
                )}
                {isShowController &&
                    classRoomReplayStore.isReady &&
                    classRoomReplayStore.fastboard &&
                    // <PlayerController
                    //     combinePlayer={classRoomReplayStore.smartPlayer.combinePlayer}
                    //     player={classRoomReplayStore.smartPlayer.whiteboardPlayer}
                    // />
                    null}
            </div>
        );
    }

    function renderRealtimePanel(): React.ReactElement {
        return (
            <RealtimePanel
                chatSlot={
                    classRoomReplayStore.fastboard && (
                        <ChatPanelReplay classRoomReplayStore={classRoomReplayStore} />
                    )
                }
                isShow={true}
                isVideoOn={
                    classRoomReplayStore.roomInfo?.roomType !== RoomType.SmallClass &&
                    classRoomReplayStore.withRTCVideo
                }
                videoSlot={
                    classRoomReplayStore.roomInfo?.roomType !== RoomType.SmallClass && (
                        <video ref={videoElRef} className="replay-big-class-video" />
                    )
                }
            />
        );
    }

    function renderOverlay(): React.ReactElement | null {
        return classRoomReplayStore.error ? (
            <div className="replay-overlay">
                <ErrorPage />
            </div>
        ) : classRoomReplayStore.isReady ? null : (
            <div className="replay-overlay">
                <LoadingPage />
            </div>
        );
    }

    function handleMouseMove(evt: React.MouseEvent<HTMLDivElement>): void {
        const { lastMouseX, lastMouseY } = lastMouseRef.current;
        lastMouseRef.current = { lastMouseX: evt.clientX, lastMouseY: evt.clientY };
        // ignore movement within a few pixels
        if (Math.abs(evt.clientX - lastMouseX) < 2 || Math.abs(evt.clientY - lastMouseY) < 2) {
            return;
        }
        setShowController(true);
        window.clearTimeout(hideControllerTimeoutRef.current);
        hideControllerTimeoutRef.current = window.setTimeout(() => {
            setShowController(false);
        }, 5000);
    }
});

export default ReplayPage;
