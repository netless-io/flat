import * as React from "react";
import { RouteComponentProps } from "react-router";
import { CursorTool } from "@netless/cursor-tool";
import polly from "polly-js";
import { message } from "antd";
import { WhiteWebSdk, PlayerPhase, Player } from "white-web-sdk";
import video_play from "./assets/image/video-play.svg";
import "video.js/dist/video-js.css";
import "./ReplayPage.less";
import PageError from "./PageError";
import PlayerController from "@netless/player-controller";
import { netlessWhiteboardApi } from "./apiMiddleware";
import { netlessToken } from "./appToken";
import LoadingPage from "./LoadingPage";
import logo from "./assets/image/logo.svg";
import ExitButtonPlayer from "./components/ExitButtonPlayer";
import { Identity } from "./IndexPage";
export type PlayerPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
}>;

export type PlayerPageStates = {
    player?: Player;
    phase: PlayerPhase;
    currentTime: number;
    isPlayerSeeking: boolean;
    isVisible: boolean;
    replayFail: boolean;
    replayState: boolean;
};

export default class NetlessPlayer extends React.Component<PlayerPageProps, PlayerPageStates> {
    public constructor(props: PlayerPageProps) {
        super(props);
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isPlayerSeeking: false,
            isVisible: false,
            replayFail: false,
            replayState: false,
        };
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    };

    public async componentDidMount(): Promise<void> {
        window.addEventListener("resize", this.onWindowResize);
        window.addEventListener("keydown", this.handleSpaceKey);
        const { uuid } = this.props.match.params;
        const roomToken = await this.getRoomToken(uuid);
        if (uuid && roomToken) {
            const whiteWebSdk = new WhiteWebSdk({ appIdentifier: netlessToken.appIdentifier });
            await this.loadPlayer(whiteWebSdk, uuid, roomToken);
        }
    }

    private loadPlayer = async (
        whiteWebSdk: WhiteWebSdk,
        uuid: string,
        roomToken: string,
    ): Promise<void> => {
        await polly()
            .waitAndRetry(10)
            .executeForPromise(async () => {
                const replayState = await whiteWebSdk.isPlayable({ room: uuid });
                if (replayState) {
                    this.setState({ replayState: true });
                    await this.startPlayer(whiteWebSdk, uuid, roomToken);
                    return Promise.resolve();
                } else {
                    this.setState({ replayState: false });
                    return Promise.reject();
                }
            });
    };

    private onWindowResize = (): void => {
        if (this.state.player) {
            this.state.player.refreshViewSize();
        }
    };

    private startPlayer = async (
        whiteWebSdk: WhiteWebSdk,
        uuid: string,
        roomToken: string,
    ): Promise<void> => {
        const cursorAdapter = new CursorTool();
        const player = await whiteWebSdk.replayRoom(
            {
                room: uuid,
                roomToken: roomToken,
                cursorAdapter: cursorAdapter,
            },
            {
                onPhaseChanged: phase => {
                    this.setState({ phase: phase });
                },
                onLoadFirstFrame: () => {
                    cursorAdapter.setPlayer(player);
                },
                onStoppedWithError: (error: Error) => {
                    message.error(`Playback error: ${error}`);
                    this.setState({ replayFail: true });
                },
                onProgressTimeChanged: (scheduleTime: number) => {
                    this.setState({ currentTime: scheduleTime });
                },
            },
        );
        (window as any).player = player;
        this.setState({
            player: player,
        });
    };

    private handleBindRoom = (ref: HTMLDivElement): void => {
        const { player } = this.state;
        if (player) {
            player.bindHtmlElement(ref);
        }
    };

    private handleSpaceKey = (evt: any): void => {
        if (evt.code === "Space") {
            if (this.state.player) {
                this.onClickOperationButton(this.state.player);
            }
        }
    };

    private onClickOperationButton = (player: Player): void => {
        switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause: {
                player.play();
                break;
            }
            case PlayerPhase.Playing: {
                player.pause();
                break;
            }
            case PlayerPhase.Ended: {
                player.seekToScheduleTime(0);
                break;
            }
        }
    };
    private renderScheduleView(): React.ReactNode {
        const { player, isVisible } = this.state;
        if (player && isVisible) {
            return (
                <div onMouseEnter={() => this.setState({ isVisible: true })}>
                    <PlayerController player={player} />
                </div>
            );
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        const { player, phase, replayState } = this.state;
        const { identity, uuid, userId } = this.props.match.params;
        if (this.state.replayFail) {
            return <PageError />;
        }
        if (!replayState) {
            return <LoadingPage text={"正在生成回放请耐心等待"} />;
        }
        if (player === undefined) {
            return <LoadingPage />;
        }
        switch (phase) {
            case PlayerPhase.WaitingFirstFrame: {
                return <LoadingPage />;
            }
            default: {
                return (
                    <div className="player-out-box">
                        <div className="logo-box">
                            <img src={logo} />
                        </div>
                        <div className="room-controller-box">
                            <div className="page-controller-mid-box">
                                <ExitButtonPlayer
                                    identity={identity}
                                    uuid={uuid}
                                    userId={userId}
                                    player={player}
                                />
                            </div>
                        </div>
                        <div className="player-board">
                            {this.renderScheduleView()}
                            <div
                                className="player-board-inner"
                                onMouseOver={() => this.setState({ isVisible: true })}
                                onMouseLeave={() => this.setState({ isVisible: false })}
                            >
                                <div
                                    onClick={() => this.onClickOperationButton(player)}
                                    className="player-mask"
                                >
                                    {phase === PlayerPhase.Pause && (
                                        <div className="player-big-icon">
                                            <img
                                                style={{ width: 50, marginLeft: 6 }}
                                                src={video_play}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div
                                    style={{ backgroundColor: "#F2F2F2" }}
                                    className="player-box"
                                    ref={this.handleBindRoom}
                                />
                            </div>
                        </div>
                    </div>
                );
            }
        }
    }
}
