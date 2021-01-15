import React from "react";
import { RouteComponentProps } from "react-router";
import { message } from "antd";
import PlayerController from "@netless/player-controller";
import LoadingPage from "./LoadingPage";
import { ipcAsyncByMain } from "./utils/ipc";
import PageError from "./PageError";
import { SmartPlayer } from "./apiMiddleware/SmartPlayer";
import { RealtimePanel } from "./components/RealtimePanel";
import { ChatPanelReplay } from "./components/ChatPanelReplay";
import ExitButtonPlayer from "./components/ExitButtonPlayer";
import { Identity } from "./utils/localStorage/room";
import { globals } from "./utils/globals";

import video_play from "./assets/image/video-play.svg";
import "video.js/dist/video-js.min.css";
import "./ReplayPage.less";
import { OrdinaryRoomInfo, ordinaryRoomInfo } from "./apiMiddleware/flatServer";
import { RoomType } from "./apiMiddleware/flatServer/constants";

export type ReplayPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
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

export default class ReplayPage extends React.Component<ReplayPageProps, ReplayPageState> {
    private whiteboardRef = React.createRef<HTMLDivElement>();
    private videoRef = React.createRef<HTMLVideoElement>();
    private smartPlayer = new SmartPlayer();

    private hideControllerTimeout: number | undefined;
    private lastMouseX: number = -100;
    private lastMouseY: number = -100;

    public constructor(props: ReplayPageProps) {
        super(props);
        this.state = {
            isReady: false,
            isPlaying: false,
            isShowController: false,
            hasError: false,

            isVisible: false,
            replayFail: false,
            replayState: false,
            withVideo: false,
            roomInfo: null,
        };

        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 700,
        });
    }

    public async componentDidMount(): Promise<void> {
        const { uuid, identity } = this.props.match.params;

        const { roomInfo } = await ordinaryRoomInfo(uuid);
        this.setState({ roomInfo });

        window.addEventListener("keydown", this.handleSpaceKey);

        const updatePlayingState = () => {
            this.setState({ isPlaying: this.smartPlayer.isPlaying });
        };

        this.smartPlayer.onReady = () => {
            this.setState({ isReady: true });
            updatePlayingState();
        };

        this.smartPlayer.onPlay = updatePlayingState;
        this.smartPlayer.onPause = updatePlayingState;
        this.smartPlayer.onEnded = updatePlayingState;

        this.smartPlayer.onError = () => {
            this.setState({ hasError: true });
            updatePlayingState();
        };

        try {
            await this.smartPlayer.load({
                roomUUID: uuid,
                whiteboardUUID: globals.whiteboard.uuid,
                whiteboardRoomToken: globals.whiteboard.token,
                identity,
                whiteboardEl: this.whiteboardRef.current!,
                videoEl: this.videoRef.current!,
            });
        } catch (error) {
            console.error(error);
            message.error(error);
            this.setState({ hasError: true });
        }

        if (this.smartPlayer.combinePlayer) {
            this.setState({ withVideo: true });
        }
    }

    public componentWillUnmount() {
        window.removeEventListener("keydown", this.handleSpaceKey);
        if (this.hideControllerTimeout !== undefined) {
            window.clearTimeout(this.hideControllerTimeout);
        }
        this.smartPlayer.destroy();
    }

    private handleSpaceKey = (evt: KeyboardEvent): void => {
        if (evt.key === "Space") {
            this.togglePlayPause();
        }
    };

    private handleMouseMove = (evt: React.MouseEvent<HTMLDivElement>): void => {
        const { lastMouseX, lastMouseY } = this;
        this.lastMouseX = evt.clientX;
        this.lastMouseY = evt.clientY;
        if (Math.abs(evt.clientX - lastMouseX) < 2 || Math.abs(evt.clientY - lastMouseY) < 2) {
            return;
        }
        if (!this.state.isShowController) {
            this.setState({ isShowController: true });
        }
        if (this.hideControllerTimeout) {
            window.clearTimeout(this.hideControllerTimeout);
        }
        this.hideControllerTimeout = window.setTimeout(() => {
            this.setState({ isShowController: false });
        }, 2000);
    };

    private togglePlayPause = (): void => {
        if (!this.smartPlayer.isReady) {
            return;
        }
        if (this.smartPlayer.isPlaying) {
            this.smartPlayer.pause();
        } else {
            if (this.smartPlayer.isEnded) {
                this.smartPlayer.seek(0);
            }
            this.smartPlayer.play();
        }
    };

    public render() {
        const { identity, uuid, userId } = this.props.match.params;
        const { roomInfo } = this.state;

        return (
            <div className="replay-container">
                {roomInfo?.roomType === RoomType.SmallClass && this.renderSmallClassAvatars()}
                <div className="replay-content">
                    {this.renderWhiteboard()}
                    {this.renderRealtimePanel()}
                </div>
                {this.renderOverlay()}
                {roomInfo && (
                    <div className="replay-exit">
                        <ExitButtonPlayer
                            roomType={roomInfo.roomType}
                            identity={identity}
                            roomUUID={uuid}
                            userUUID={userId}
                            history={this.props.history}
                        />
                    </div>
                )}
            </div>
        );
    }

    renderSmallClassAvatars(): React.ReactNode {
        return (
            <div className="replay-small-class-avatars">
                <video className="replay-small-class-avatars-video" ref={this.videoRef} />
            </div>
        );
    }

    renderWhiteboard(): React.ReactNode {
        const { isReady, isPlaying, isShowController } = this.state;

        return (
            <div className="replay-whiteboard-wrap">
                <div
                    className="replay-whiteboard"
                    ref={this.whiteboardRef}
                    onMouseMove={this.handleMouseMove}
                ></div>
                {!isPlaying && (
                    <div className="replay-play-overlay" onClick={this.togglePlayPause}>
                        <button className="replay-play-icon">
                            <img src={video_play} alt="play" />
                        </button>
                    </div>
                )}
                {isShowController && isReady && this.smartPlayer.whiteboardPlayer && (
                    <PlayerController
                        player={this.smartPlayer.whiteboardPlayer}
                        combinePlayer={this.smartPlayer.combinePlayer}
                    />
                )}
            </div>
        );
    }

    renderRealtimePanel(): React.ReactNode {
        const { uuid, userId } = this.props.match.params;
        const { withVideo, roomInfo } = this.state;

        return (
            <RealtimePanel
                isVideoOn={roomInfo?.roomType === RoomType.BigClass && withVideo}
                isShow={true}
                videoSlot={
                    roomInfo?.roomType === RoomType.BigClass && (
                        <video className="replay-big-class-video" ref={this.videoRef} />
                    )
                }
                chatSlot={
                    this.smartPlayer.whiteboardPlayer && (
                        <ChatPanelReplay
                            userId={userId}
                            channelID={uuid}
                            player={this.smartPlayer.whiteboardPlayer}
                        />
                    )
                }
            />
        );
    }

    renderOverlay(): React.ReactNode {
        const { isReady, hasError } = this.state;

        return hasError ? (
            <div className="replay-overlay">
                <PageError />
            </div>
        ) : isReady ? null : (
            <div className="replay-overlay">
                <LoadingPage text={"正在生成回放请耐心等待"} />
            </div>
        );
    }
}
