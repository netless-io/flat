import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps, useParams, useHistory } from "react-router-dom";
import { ErrorPage, LoadingPage, TopBar, WindowsSystemBtnItem } from "flat-components";
import PlayerController from "@netless/player-controller";
import { ipcAsyncByMainWindow, ipcReceive, ipcReceiveRemove } from "../../utils/ipc";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanelReplay } from "../../components/ChatPanelReplay";
import { OrdinaryRoomInfo } from "../../api-middleware/flatServer";
import { RoomType } from "../../api-middleware/flatServer/constants";
import { observer } from "mobx-react-lite";
import { useClassRoomReplayStore } from "../../stores/class-room-replay-store";
import { RouteNameType, RouteParams } from "../../utils/routes";

import videoPlaySVG from "../../assets/image/video-play.svg";
import "video.js/dist/video-js.min.css";
import "@netless/window-manager/dist/style.css";
import "./ReplayPage.less";
import { ExitReplayConfirmModal } from "../../components/Modal/ExitReplayConfirmModal";
import { errorTips } from "../../components/Tips/ErrorTips";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import { runtime } from "../../utils/runtime";
import { roomStore } from "../../stores/room-store";

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
    useWindowSize("Replay");

    const whiteboardElRef = useRef<HTMLDivElement>(null);
    const videoElRef = useRef<HTMLVideoElement>(null);
    const [showExitReplayModal, setShowExitReplayModal] = useState(false);
    const history = useHistory();

    const params = useParams<RouteParams<RouteNameType.ReplayPage>>();
    const classRoomReplayStore = useClassRoomReplayStore(
        params.roomUUID,
        params.ownerUUID,
        params.roomType,
    );

    const roomInfo = roomStore.rooms.get(params.roomUUID);

    const [isShowController, setShowController] = useState(false);
    const hideControllerTimeoutRef = useRef<number>();
    const lastMouseRef = useRef({ lastMouseX: -100, lastMouseY: -100 });

    useEffect(() => {
        ipcAsyncByMainWindow("disable-window", {
            disable: true,
        });
        ipcReceive("window-will-close", () => {
            setShowExitReplayModal(true);
        });

        return () => {
            window.clearTimeout(hideControllerTimeoutRef.current);

            ipcAsyncByMainWindow("disable-window", {
                disable: false,
            });

            ipcReceiveRemove("window-will-close");
        };
    }, []);

    useEffect(() => {
        classRoomReplayStore.init(whiteboardElRef.current!, videoElRef.current!).catch(errorTips);

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

    const onClickWindowsSystemBtn = (winSystemBtn: WindowsSystemBtnItem): void => {
        ipcAsyncByMainWindow("set-win-status", { windowStatus: winSystemBtn });
    };

    function renderTopBarLeft(): React.ReactNode {
        return <div className="replay-top-bar-title">{roomInfo?.title}</div>;
    }

    return (
        <div className="replay-container">
            <div className="replay-top-bar">
                {!runtime.isMac && (
                    <TopBar
                        isMac={runtime.isMac}
                        left={renderTopBarLeft()}
                        onClickWindowsSystemBtn={onClickWindowsSystemBtn}
                    />
                )}
            </div>
            {classRoomReplayStore.roomType === RoomType.SmallClass && renderSmallClassAvatars()}
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
                    classRoomReplayStore.smartPlayer.whiteboardPlayer && (
                        <PlayerController
                            combinePlayer={classRoomReplayStore.smartPlayer.combinePlayer}
                            player={classRoomReplayStore.smartPlayer.whiteboardPlayer}
                        />
                    )}
            </div>
        );
    }

    function renderRealtimePanel(): React.ReactElement {
        return (
            <RealtimePanel
                chatSlot={
                    classRoomReplayStore.smartPlayer.whiteboardPlayer && (
                        <ChatPanelReplay classRoomReplayStore={classRoomReplayStore} />
                    )
                }
                isShow={true}
                isVideoOn={
                    classRoomReplayStore.roomType !== RoomType.SmallClass &&
                    classRoomReplayStore.withRTCVideo
                }
                videoSlot={
                    classRoomReplayStore.roomType !== RoomType.SmallClass && (
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
