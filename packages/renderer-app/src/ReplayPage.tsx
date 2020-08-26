import * as React from "react";
import { RouteComponentProps } from "react-router";
import { message } from "antd";
import { WhiteWebSdk, PlayerPhase, Player, RenderEngine } from "white-web-sdk";
import player_stop from "./assets/image/player_stop.svg";
import player_begin from "./assets/image/player_begin.svg";
import "video.js/dist/video-js.css";
import "./ReplayPage.less";
import { LoadingOutlined } from "@ant-design/icons";
import PageError from "./PageError";
import PlayerController from "@netless/player-controller";
import { netlessWhiteboardApi } from "./apiMiddleware";
import { netlessToken } from "./appToken";
export type PlayerPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
}>;

export type PlayerPageStates = {
    player?: Player;
    phase: PlayerPhase;
    currentTime: number;
    isFirstScreenReady: boolean;
    isPlayerSeeking: boolean;
    isVisible: boolean;
    replayFail: boolean;
};

export default class NetlessPlayer extends React.Component<PlayerPageProps, PlayerPageStates> {
    public constructor(props: PlayerPageProps) {
        super(props);
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isFirstScreenReady: false,
            isPlayerSeeking: false,
            isVisible: false,
            replayFail: false,
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
            const whiteWebSdk = new WhiteWebSdk({
                appIdentifier: netlessToken.appIdentifier,
                renderEngine: RenderEngine.Canvas,
            });
            const player = await whiteWebSdk.replayRoom(
                {
                    room: uuid,
                    roomToken: roomToken,
                },
                {
                    onPhaseChanged: phase => {
                        this.setState({ phase: phase });
                    },
                    onLoadFirstFrame: () => {},
                    onSliceChanged: () => {},
                    onPlayerStateChanged: () => {},
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
        }
    }
    private onWindowResize = (): void => {
        if (this.state.player) {
            this.state.player.refreshViewSize();
        }
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

    private operationButtonBig = (phase: PlayerPhase): React.ReactNode => {
        switch (phase) {
            case PlayerPhase.Playing: {
                return <img style={{ width: 28 }} src={player_begin} />;
            }
            case PlayerPhase.Buffering: {
                return <LoadingOutlined style={{ fontSize: 18, color: "white" }} />;
            }
            case PlayerPhase.Ended: {
                return <img style={{ marginLeft: 6, width: 28 }} src={player_stop} />;
            }
            default: {
                return <img style={{ marginLeft: 6, width: 28 }} src={player_stop} />;
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

    private renderLoading = (): React.ReactNode => {
        const { player } = this.state;
        if (player) {
            return null;
        } else {
            return (
                <div className="white-board-loading">
                    <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/fast-sdk/icons/loading.svg" />
                </div>
            );
        }
    };

    public render(): React.ReactNode {
        const { player } = this.state;
        if (this.state.replayFail) {
            return <PageError />;
        }
        return (
            <div className="player-out-box">
                {this.renderLoading()}
                <div className="player-board">
                    {this.renderScheduleView()}
                    <div
                        className="player-board-inner"
                        onMouseOver={() => this.setState({ isVisible: true })}
                        onMouseLeave={() => this.setState({ isVisible: false })}
                    >
                        <div
                            onClick={() => {
                                if (this.state.player) {
                                    this.onClickOperationButton(this.state.player);
                                }
                            }}
                            className="player-mask"
                        >
                            {this.state.phase === PlayerPhase.Pause && (
                                <div className="player-big-icon">
                                    {this.operationButtonBig(this.state.phase)}
                                </div>
                            )}
                        </div>
                        {player && (
                            <div
                                style={{ backgroundColor: "#F2F2F2" }}
                                className="player-box"
                                ref={this.handleBindRoom}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
