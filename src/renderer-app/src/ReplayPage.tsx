import * as React from "react";
import { RouteComponentProps } from "react-router";
import { message } from "antd";
import PlayerController from "@netless/player-controller";
import LoadingPage from "./LoadingPage";
import { ipcAsyncByMain } from "./utils/Ipc";
import { Identity } from "./IndexPage";
import PageError from "./PageError";
import { SmartPlayer } from "./apiMiddleware/SmartPlayer";
import { RealtimePanel } from "./components/RealtimePanel";
import ExitButtonPlayer from "./components/ExitButtonPlayer";

import video_play from "./assets/image/video-play.svg";
import "./ReplayPage.less";

export type ReplayPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
}>;

export type ReplayPageStates = {
    isVideoOn: boolean;
    isRealtimePanelShow: boolean;
    isReady: boolean;
    isPlaying: boolean;
    isShowController: boolean;
    hasError: boolean;

    isVisible: boolean;
    replayFail: boolean;
    replayState: boolean;
};

export default class ReplayPage extends React.Component<ReplayPageProps, ReplayPageStates> {
    private whiteboardRef = React.createRef<HTMLDivElement>();
    private videoRef = React.createRef<HTMLVideoElement>();
    private smartPlayer = new SmartPlayer();

    private hideControllerTimeout: number | undefined;
    private lastMouseX: number = -100;
    private lastMouseY: number = -100;

    public constructor(props: ReplayPageProps) {
        super(props);
        this.state = {
            isVideoOn: false,
            isRealtimePanelShow: false,
            isReady: false,
            isPlaying: false,
            isShowController: false,
            hasError: false,

            isVisible: false,
            replayFail: false,
            replayState: false,
        };
        ipcAsyncByMain("set-win-size", {
            width: 1440,
            height: 688,
        });
    }

    public async componentDidMount(): Promise<void> {
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

        const { uuid, identity } = this.props.match.params;
        try {
            await this.smartPlayer.load({
                uuid,
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
            this.setState({ isRealtimePanelShow: true, isVideoOn: true });
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

    private handleRealtimePanelSwitch = () => {
        this.setState(state => ({ isRealtimePanelShow: !state.isRealtimePanelShow }));
    };

    public render() {
        const { identity, uuid, userId } = this.props.match.params;
        const { isReady, isPlaying, isShowController, hasError } = this.state;

        return (
            <div className="replay-container">
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
                        // @TODO 等待 player-controller 更新
                        <PlayerController player={this.smartPlayer.whiteboardPlayer} />
                    )}
                </div>
                <RealtimePanel
                    isVideoOn={this.state.isVideoOn}
                    isShow={this.state.isRealtimePanelShow}
                    onSwitch={this.handleRealtimePanelSwitch}
                    videoSlot={<video className="replay-video" ref={this.videoRef} />}
                    chatSlot={null}
                />
                {hasError ? (
                    <div className="replay-overlay">
                        <PageError />
                    </div>
                ) : isReady ? null : (
                    <div className="replay-overlay">
                        <LoadingPage text={"正在生成回放请耐心等待"} />
                    </div>
                )}
                <div className="replay-exit">
                    <ExitButtonPlayer identity={identity} uuid={uuid} userId={userId} />
                </div>
            </div>
        );
    }
}
