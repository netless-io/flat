import path from "path";
import { v4 as uuidv4 } from "uuid";

import React from "react";
import { RouteComponentProps } from "react-router";
import { message, Tooltip } from "antd";
import classNames from "classnames";

import { Room, RoomPhase, ViewMode } from "white-web-sdk";
import ToolBox from "@netless/tool-box";
import RedoUndo from "@netless/redo-undo";
import PageController from "@netless/page-controller";
import ZoomController from "@netless/zoom-controller";
import OssUploadButton from "@netless/oss-upload-button";
import PreviewController from "@netless/preview-controller";
import DocsCenter from "@netless/docs-center";
import OssDropUpload from "@netless/oss-drop-upload";

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

import { NETLESS, OSS } from "./constants/Process";
import { getRoom, Identity, updateRoomProps } from "./utils/localStorage/room";
import { listDir } from "./utils/Fs";
import { runtime } from "./utils/Runtime";
import { ipcAsyncByMain } from "./utils/Ipc";

import pages from "./assets/image/pages.svg";
import { Whiteboard, WhiteboardRenderProps } from "./components/Whiteboard";

import "./WhiteboardPage.less";

export type WhiteboardPageStates = {
    isMenuVisible: boolean;
    isFileOpen: boolean;
    isRecording: boolean;
    isCalling: boolean;
    isRealtimeSideOpen: boolean;
    recordingUuid?: string;
    rtcUid: string | null;
    isClassBegin: boolean;
    speakingJoiner: string | null;
    mainSpeaker: string | null;
};

export type WhiteboardPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
}>;

export class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageStates> {
    private rtc = new Rtc();
    private cloudRecording: CloudRecording | null = null;
    private cloudRecordingInterval: number | undefined;

    private recordStartTime: number | null = null;

    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            isMenuVisible: false,
            isFileOpen: false,
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

    private handlePreviewState = (state: boolean): void => {
        this.setState({ isMenuVisible: state });
    };

    private handleDocCenterState = (state: boolean): void => {
        this.setState({ isFileOpen: state });
    };

    private handleRoomController = (room: Room): void => {
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
        const { uuid, identity, userId } = this.props.match.params;
        return (
            <Whiteboard roomId={uuid} userId={userId} identity={identity}>
                {(props: WhiteboardRenderProps) => {
                    const { room, phase } = props;
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
                            return this.renderWhiteBoard(props, room);
                        }
                    }
                }}
            </Whiteboard>
        );
    }

    private renderWhiteBoard(props: WhiteboardRenderProps, room: Room): React.ReactNode {
        const { isMenuVisible, isFileOpen } = this.state;

        return (
            <div className="realtime-box">
                <TopBar
                    left={this.renderTopBarLeft()}
                    center={this.renderTopBarCenter()}
                    right={this.renderTopBarRight(props, room)}
                />
                <div className="realtime-content">
                    <div className="realtime-content-main">
                        <div className="tool-box-out">
                            <ToolBox
                                room={room}
                                customerComponent={[
                                    <OssUploadButton
                                        oss={WhiteboardPage.ossConfig}
                                        appIdentifier={NETLESS.APP_IDENTIFIER}
                                        sdkToken={NETLESS.SDK_TOKEN}
                                        room={room}
                                        whiteboardRef={props.whiteboardRef}
                                    />,
                                ]}
                            />
                        </div>
                        <div className="redo-undo-box">
                            <RedoUndo room={room} />
                        </div>
                        <div className="zoom-controller-box">
                            <ZoomController room={room} />
                        </div>
                        <div className="page-controller-box">
                            <div className="page-controller-mid-box">
                                <Tooltip placement="top" title={"Page preview"}>
                                    <div
                                        className="page-controller-cell"
                                        onClick={() => this.handlePreviewState(true)}
                                    >
                                        <img src={pages} alt={"pages"} />
                                    </div>
                                </Tooltip>
                                <PageController room={room} />
                            </div>
                        </div>
                        <PreviewController
                            handlePreviewState={this.handlePreviewState}
                            isVisible={isMenuVisible}
                            room={room}
                        />
                        <DocsCenter
                            handleDocCenterState={this.handleDocCenterState}
                            isFileOpen={isFileOpen}
                            room={room}
                        />
                        <OssDropUpload room={room} oss={WhiteboardPage.ossConfig}>
                            <div ref={props.handleBindRoom} className="whiteboard-box" />
                        </OssDropUpload>
                    </div>
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

    private renderTopBarRight(props: WhiteboardRenderProps, room: Room): React.ReactNode {
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
                    active={props.viewMode === ViewMode.Broadcaster}
                    onClick={() => {
                        this.handleRoomController(room);
                    }}
                />
                <TopBarRightBtn
                    title="Docs center"
                    icon="folder"
                    onClick={() => {
                        console.log(
                            listDir(path.join(runtime.downloadsDirectory, "dynamicConvert")),
                        );
                        this.setState({ isFileOpen: !this.state.isFileOpen });
                    }}
                />
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

    static get ossConfig() {
        return {
            accessKeyId: OSS.ACCESS_KEY_ID,
            accessKeySecret: OSS.ACCESS_KEY_SECRET!,
            region: OSS.REGION!,
            bucket: OSS.BUCKET!,
            folder: OSS.FOLDER!,
            prefix: OSS.PREFIX!,
        };
    }
}

export default WhiteboardPage;
