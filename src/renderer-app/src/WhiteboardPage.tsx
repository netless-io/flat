import React from "react";
import { message } from "antd";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { RoomPhase, ViewMode } from "white-web-sdk";

import { Rtc } from "./apiMiddleware/Rtc";
import { CloudRecording } from "./apiMiddleware/CloudRecording";
import PageError from "./PageError";
import LoadingPage from "./LoadingPage";

import InviteButton from "./components/InviteButton";
import { TopBar, TopBarDivider } from "./components/TopBar";
import { TopBarClassOperations } from "./components/TopBarClassOperations";
import { TopBarRightBtn } from "./components/TopBarRightBtn";
import { RealtimePanel } from "./components/RealtimePanel";
import { ChatPanel } from "./components/ChatPanel";
import { VideoAvatar, VideoType } from "./components/VideoAvatar";
import { NetworkStatus } from "./components/NetworkStatus";
import { RecordButton } from "./components/RecordButton";
import { ClassStatus } from "./components/ClassStatus";
import { withWhiteboardRoute, WithWhiteboardRouteProps } from "./components/Whiteboard";

import { getRoom, Identity, updateRoomProps } from "./utils/localStorage/room";
import { ipcAsyncByMain } from "./utils/Ipc";

import "./WhiteboardPage.less";

export type WhiteboardPageState = {
    isRecording: boolean;
    isCalling: boolean;
    isRealtimeSideOpen: boolean;
    recordingUuid?: string;
    rtcUid: string | null;
    isClassBegin: boolean;
    speakingJoiner: string | null;
    mainSpeaker: string | null;
};

export type WhiteboardPageProps = WithWhiteboardRouteProps;

class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {
    private rtc = new Rtc();
    private cloudRecording: CloudRecording | null = null;
    private cloudRecordingInterval: number | undefined;

    private recordStartTime: number | null = null;

    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            isRecording: false,
            isCalling: false,
            isRealtimeSideOpen: true,
            rtcUid: null,
            isClassBegin: false,
            speakingJoiner: null,
            mainSpeaker: null,
        };
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 700,
        });
    }

    public async componentDidMount(): Promise<void> {
        const { uuid, identity } = this.props.match.params;

        if (identity === Identity.creator) {
            this.rtc.rtcEngine.on("joinedChannel", async (_channel, uid) => {
                this.setState({ rtcUid: String(uid) });
            });
        } else {
            this.rtc.rtcEngine.once("userJoined", uid => {
                this.setState({ rtcUid: String(uid) });
            });
        }

        const room = getRoom(uuid);
        if (room?.roomName) {
            document.title = room.roomName;
        }
    }

    public async componentWillUnmount(): Promise<void> {
        if (this.state.isCalling) {
            this.rtc.leave();
        }
        if (this.cloudRecordingInterval) {
            window.clearInterval(this.cloudRecordingInterval);
            this.cloudRecordingInterval = void 0;
        }
        if (this.recordStartTime !== null) {
            this.saveRecording({
                uuid: uuidv4(),
                startTime: this.recordStartTime,
                endTime: Date.now(),
                videoUrl: this.cloudRecording?.isRecording ? this.getm3u8url() : undefined,
            });
        }
        if (this.cloudRecording?.isRecording) {
            try {
                await this.cloudRecording.stop();
            } catch (e) {
                console.error(e);
            }
        }
        this.cloudRecording = null;

        this.rtc.destroy();
    }

    private saveRecording = (recording: {
        uuid: string;
        startTime: number;
        endTime: number;
        videoUrl?: string;
    }): void => {
        const roomId = this.props.match.params.uuid;
        const room = getRoom(roomId);
        if (room) {
            if (room.recordings) {
                room.recordings.push(recording);
            } else {
                room.recordings = [recording];
            }
            updateRoomProps(roomId, room);
        }
        this.setState({ recordingUuid: recording.uuid });
        this.recordStartTime = null;
    };

    private getm3u8url(): string {
        if (!this.cloudRecording) {
            return "";
        }
        return `https://netless-cn-agora-whiteboard-dev.oss-cn-hangzhou.aliyuncs.com/AgoraCloudRecording/${this.cloudRecording.sid}_${this.cloudRecording.cname}.m3u8`;
    }

    private handleRoomController = (): void => {
        const { room } = this.props.whiteboard;
        if (!room) {
            return;
        }
        if (room.state.broadcastState.mode !== ViewMode.Broadcaster) {
            room.setViewMode(ViewMode.Broadcaster);
            message.success("其他用户将跟随您的视角");
        } else {
            room.setViewMode(ViewMode.Freedom);
            message.success("其他用户将停止跟随您的视角");
        }
    };

    private handleSideOpenerSwitch = (): void => {
        this.setState(state => ({ isRealtimeSideOpen: !state.isRealtimeSideOpen }));
    };

    private toggleRecording = async (): Promise<void> => {
        if (this.state.isRecording) {
            this.setState({ isRecording: false });
            if (this.recordStartTime !== null) {
                this.saveRecording({
                    uuid: uuidv4(),
                    startTime: this.recordStartTime,
                    endTime: Date.now(),
                    videoUrl: this.cloudRecording?.isRecording ? this.getm3u8url() : undefined,
                });
            }
            if (this.cloudRecordingInterval) {
                window.clearInterval(this.cloudRecordingInterval);
            }
            if (this.cloudRecording?.isRecording) {
                try {
                    await this.cloudRecording.stop();
                } catch (e) {
                    console.error(e);
                }
            }
            this.cloudRecording = null;
        } else {
            this.setState({ isRecording: true });
            this.recordStartTime = Date.now();
            if (this.state.isCalling && !this.cloudRecording?.isRecording) {
                this.cloudRecording = new CloudRecording({
                    cname: this.props.match.params.uuid,
                    uid: "1", // 不能与频道内其他用户冲突
                });
                await this.cloudRecording.start({
                    storageConfig: this.cloudRecording.defaultStorageConfig(),
                    recordingConfig: {
                        channelType: 1, // 直播
                        transcodingConfig: {
                            width: 288,
                            height: 216,
                            // https://docs.agora.io/cn/cloud-recording/recording_video_profile
                            fps: 15,
                            bitrate: 280,
                        },
                        subscribeUidGroup: 0,
                    },
                });
                // @TODO 临时避免频道被关闭（默认30秒无活动），后面会根据我们的需求修改并用 polly-js 管理重发。
                this.cloudRecordingInterval = window.setInterval(() => {
                    if (this.cloudRecording?.isRecording) {
                        this.cloudRecording.query().catch(console.warn);
                    }
                }, 10000);
            }
        }
    };

    private toggleCalling = async (): Promise<void> => {
        if (this.state.isCalling) {
            this.setState({ isCalling: false });
            if (this.cloudRecording?.isRecording) {
                await this.toggleRecording();
                if (this.cloudRecordingInterval) {
                    clearInterval(this.cloudRecordingInterval);
                }
            }
            this.rtc.leave();
        } else {
            this.setState({ isCalling: true, isRealtimeSideOpen: true });
            const { uuid, identity, userId } = this.props.match.params;
            this.rtc.join(uuid, identity, userId);
        }
    };

    private onJoinerSpeak = (uid: string, speak: boolean): void => {
        this.setState(
            speak
                ? { speakingJoiner: uid, mainSpeaker: uid }
                : { speakingJoiner: null, mainSpeaker: null },
            () => {
                const { userId } = this.props.match.params;
                if (userId === uid) {
                    if (speak) {
                        this.rtc.rtcEngine.setClientRole(speak ? 1 : 2);
                    }
                }
            },
        );
    };

    private onVideoAvatarExpand = (): void => {
        this.setState(state => ({
            mainSpeaker: state.mainSpeaker === state.rtcUid ? state.speakingJoiner : state.rtcUid,
        }));
    };

    private openReplayPage = () => {
        // @TODO 打开到当前的录制记录中
        const { uuid, identity, userId } = this.props.match.params;
        this.props.history.push(`/replay/${identity}/${uuid}/${userId}/`);
    };

    public render(): React.ReactNode {
        const { room, phase } = this.props.whiteboard;

        if (room === null || room === undefined) {
            return <LoadingPage />;
        }

        switch (phase) {
            case RoomPhase.Connecting ||
                RoomPhase.Disconnecting ||
                RoomPhase.Reconnecting ||
                RoomPhase.Reconnecting: {
                return <LoadingPage />;
            }
            case RoomPhase.Disconnected: {
                return <PageError />;
            }
            default: {
                return this.renderWhiteBoard();
            }
        }
    }

    private renderWhiteBoard(): React.ReactNode {
        return (
            <div className="realtime-box">
                <TopBar
                    left={this.renderTopBarLeft()}
                    center={this.renderTopBarCenter()}
                    right={this.renderTopBarRight()}
                />
                <div className="realtime-content">
                    {this.props.whiteboard.whiteboardElement}
                    {this.renderRealtimePanel()}
                </div>
            </div>
        );
    }

    private renderTopBarLeft(): React.ReactNode {
        const { identity } = this.props.match.params;
        const { isClassBegin } = this.state;
        return (
            <>
                <NetworkStatus />
                {identity === Identity.joiner && <ClassStatus isClassBegin={isClassBegin} />}
            </>
        );
    }

    private renderTopBarCenter(): React.ReactNode {
        const { identity } = this.props.match.params;
        const { isClassBegin } = this.state;

        return identity === Identity.creator ? (
            <TopBarClassOperations
                isBegin={isClassBegin}
                // @TODO 实现上课逻辑
                onBegin={() => this.setState({ isClassBegin: true })}
                onPause={() => this.setState({ isClassBegin: false })}
                onStop={() => this.setState({ isClassBegin: false })}
            />
        ) : null;
    }

    private renderTopBarRight(): React.ReactNode {
        const { viewMode, toggleDocCenter } = this.props.whiteboard;
        const { isCalling, isRecording, isRealtimeSideOpen } = this.state;
        const { uuid } = this.props.match.params;

        return (
            <>
                <RecordButton
                    // @TODO 待填充逻辑
                    disabled={false}
                    isRecording={isRecording}
                    onClick={this.toggleRecording}
                />
                <TopBarRightBtn
                    title="Call"
                    icon="phone"
                    active={isCalling}
                    onClick={this.toggleCalling}
                />
                <TopBarRightBtn
                    title="Vision control"
                    icon="follow"
                    active={viewMode === ViewMode.Broadcaster}
                    onClick={this.handleRoomController}
                />
                <TopBarRightBtn title="Docs center" icon="folder" onClick={toggleDocCenter} />
                <InviteButton uuid={uuid} />
                {/* @TODO */}
                <TopBarRightBtn title="Options" icon="options" onClick={() => {}} />
                <TopBarDivider />
                <TopBarRightBtn
                    title="Open side panel"
                    icon="hide-side"
                    active={isRealtimeSideOpen}
                    onClick={this.handleSideOpenerSwitch}
                />
            </>
        );
    }

    private renderRealtimePanel(): React.ReactNode {
        const { uuid, userId, identity } = this.props.match.params;

        const { isRealtimeSideOpen, isCalling, rtcUid, speakingJoiner, mainSpeaker } = this.state;

        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={isCalling}
                videoSlot={
                    isCalling &&
                    rtcUid && (
                        <div className="whiteboard-rtc-box">
                            <div
                                className={classNames("whiteboard-rtc-avatar", {
                                    "is-small": mainSpeaker !== null && mainSpeaker !== rtcUid,
                                })}
                            >
                                <VideoAvatar
                                    uid={rtcUid}
                                    type={rtcUid === userId ? VideoType.local : VideoType.remote}
                                    rtcEngine={this.rtc.rtcEngine}
                                    small={mainSpeaker !== null && mainSpeaker !== rtcUid}
                                    onExpand={this.onVideoAvatarExpand}
                                />
                            </div>
                            {speakingJoiner !== null && (
                                <div
                                    className={classNames("whiteboard-rtc-avatar", {
                                        "is-small": mainSpeaker !== speakingJoiner,
                                    })}
                                >
                                    <VideoAvatar
                                        uid={speakingJoiner}
                                        type={
                                            speakingJoiner === userId
                                                ? VideoType.local
                                                : VideoType.remote
                                        }
                                        rtcEngine={this.rtc.rtcEngine}
                                        small={mainSpeaker !== speakingJoiner}
                                        onExpand={this.onVideoAvatarExpand}
                                    />
                                </div>
                            )}
                        </div>
                    )
                }
                chatSlot={
                    <ChatPanel
                        userId={userId}
                        channelId={uuid}
                        identity={identity}
                        onSpeak={this.onJoinerSpeak}
                    ></ChatPanel>
                }
            />
        );
    }
}

export default withWhiteboardRoute(WhiteboardPage);
