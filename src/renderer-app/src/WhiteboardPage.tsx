import path from "path";
import { v4 as uuidv4 } from "uuid";

import React from "react";
import { RouteComponentProps } from "react-router";
import { message, Tooltip } from "antd";

import { createPlugins, Room, RoomPhase, RoomState, ViewMode, WhiteWebSdk } from "white-web-sdk";
import ToolBox from "@netless/tool-box";
import RedoUndo from "@netless/redo-undo";
import PageController from "@netless/page-controller";
import ZoomController from "@netless/zoom-controller";
import OssUploadButton from "@netless/oss-upload-button";
import { videoPlugin } from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import PreviewController from "@netless/preview-controller";
import DocsCenter from "@netless/docs-center";
import { CursorTool } from "@netless/cursor-tool";
import { PPTDataType, PPTType } from "@netless/oss-upload-manager";
import OssDropUpload from "@netless/oss-drop-upload";

import { netlessWhiteboardApi } from "./apiMiddleware";
import { pptDatas } from "./taskUuids";
import { Rtc } from "./apiMiddleware/Rtc";
import { CloudRecording } from "./apiMiddleware/CloudRecording";
import PageError from "./PageError";
import LoadingPage from "./LoadingPage";

import InviteButton from "./components/InviteButton";
import { TopBar } from "./components/TopBar";
import { TopBarRecordStatus } from "./components/TopBarRecordStatus";
import { TopBarRightBtn } from "./components/TopBarRightBtn";
import { RealtimePanel } from "./components/RealtimePanel";
import { ChatPanel } from "./components/ChatPanel";
import { VideoAvatars } from "./components/VideoAvatars";

import { NETLESS, NODE_ENV, OSS } from "./constants/Process";
import { getRoom, Identity, updateRoomProps } from "./utils/localStorage/room";
import { listDir } from "./utils/Fs";
import { runtime } from "./utils/Runtime";
import { ipcAsyncByMain } from "./utils/Ipc";

import pages from "./assets/image/pages.svg";

import "./WhiteboardPage.less";

export type WhiteboardPageStates = {
    phase: RoomPhase;
    room?: Room;
    isMenuVisible: boolean;
    isFileOpen: boolean;
    isRecording: boolean;
    isCalling: boolean;
    isRealtimeSideOpen: boolean;
    recordingUuid?: string;
    mode?: ViewMode;
    whiteboardLayerDownRef?: HTMLDivElement;
    roomController?: ViewMode;
    rtcUid: number | null;
    rtcUsers: number[];
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
            phase: RoomPhase.Connecting,
            isMenuVisible: false,
            isFileOpen: false,
            isRecording: false,
            isCalling: false,
            isRealtimeSideOpen: false,
            rtcUid: null,
            rtcUsers: [],
        };
        ipcAsyncByMain("set-win-size", {
            width: 1440,
            height: 688,
        });
    }

    public async componentDidMount(): Promise<void> {
        this.rtc.rtcEngine.on("joinedChannel", async (_channel, rtcUid) => {
            this.setState({ rtcUid });
        });
        await this.startJoinRoom();
        const room = getRoom(this.props.match.params.uuid);
        if (room?.roomName) {
            document.title = room.roomName;
        }
    }

    public componentDidUpdate(
        _prevProps: WhiteboardPageProps,
        prevState: WhiteboardPageStates,
    ): void {
        if (this.state.rtcUid !== null && prevState.rtcUid !== null) {
            // 这里分为单人广播，一对一，一对多，现在 2.0 的设计是混到一起，
            // 所以这三种情况切换的时候需要更新云录制布局。
            const prevLen = prevState.rtcUsers.length;
            const currLen = this.state.rtcUsers.length;
            if (prevLen !== currLen && (prevLen < 4 || currLen < 4)) {
                this.cloudRecording?.updateLayout({
                    mixedVideoLayout: 3,
                    layoutConfig: this.getLayoutConfig(),
                });
            }
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

        if (this.state.room) {
            this.state.room.callbacks.off();
        }

        if (NODE_ENV === "development") {
            (window as any).room = null;
        }
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (roomToken) {
            return roomToken;
        } else {
            return null;
        }
    };

    private handleBindRoom = (ref: HTMLDivElement): void => {
        const { room } = this.state;
        this.setState({ whiteboardLayerDownRef: ref });
        if (room) {
            room.bindHtmlElement(ref);
        }
    };

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

    private setDefaultPptData = (pptDatas: string[], room: Room): void => {
        const docs: PPTDataType[] = (room.state.globalState as any).docs;
        if (docs && docs.length > 1) {
            return;
        }
        if (pptDatas.length > 0) {
            for (let pptData of pptDatas) {
                const sceneId = uuidv4();
                const scenes = JSON.parse(pptData);
                const documentFile: PPTDataType = {
                    active: false,
                    id: sceneId,
                    pptType: PPTType.dynamic,
                    data: scenes,
                };
                const docs = (room.state.globalState as any).docs;
                if (docs && docs.length > 0) {
                    const newDocs = [documentFile, ...docs];
                    room.setGlobalState({ docs: newDocs });
                } else {
                    room.setGlobalState({ docs: [documentFile] });
                }
                room.putScenes(`/${room.uuid}/${sceneId}`, scenes);
            }
        }
    };

    private startJoinRoom = async (): Promise<void> => {
        const { uuid, userId, identity } = this.props.match.params;
        try {
            const roomToken = await this.getRoomToken(uuid);
            if (uuid && roomToken) {
                const plugins = createPlugins({ video: videoPlugin, audio: audioPlugin });
                plugins.setPluginContext("video", {
                    identity: identity === Identity.creator ? "host" : "",
                });
                plugins.setPluginContext("audio", {
                    identity: identity === Identity.creator ? "host" : "",
                });
                const whiteWebSdk = new WhiteWebSdk({
                    appIdentifier: NETLESS.APP_IDENTIFIER,
                    plugins: plugins,
                });
                const cursorName = localStorage.getItem("userName");
                const cursorAdapter = new CursorTool();
                const room = await whiteWebSdk.joinRoom(
                    {
                        uuid: uuid,
                        roomToken: roomToken,
                        cursorAdapter: cursorAdapter,
                        userPayload: {
                            userId: userId,
                            cursorName: cursorName,
                        },
                        floatBar: true,
                    },
                    {
                        onPhaseChanged: phase => {
                            this.setState({ phase: phase });
                        },
                        onRoomStateChanged: (modifyState: Partial<RoomState>): void => {
                            if (modifyState.broadcastState) {
                                this.setState({ mode: modifyState.broadcastState.mode });
                            }
                        },
                        onDisconnectWithError: error => {
                            console.error(error);
                        },
                        onKickedWithReason: reason => {
                            console.error("kicked with reason: " + reason);
                        },
                    },
                );
                cursorAdapter.setRoom(room);
                this.setDefaultPptData(pptDatas, room);
                room.setMemberState({
                    pencilOptions: {
                        disableBezier: false,
                        sparseHump: 1.0,
                        sparseWidth: 1.0,
                        enableDrawPoint: false,
                    },
                });
                if (room.state.broadcastState) {
                    this.setState({ mode: room.state.broadcastState.mode });
                }
                this.setState({ room: room });
                if (NODE_ENV === "development") {
                    (window as any).room = room;
                }
            }
        } catch (error) {
            message.error(error);
            console.log(error);
        }
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
                        channelType: 0,
                        subscribeUidGroup: 1, // 3~7 uids
                        transcodingConfig: {
                            backgroundColor: "#ffffff",
                            width: 280,
                            height: 280,
                            fps: 15,
                            bitrate: 140,
                            mixedVideoLayout: 3,
                            layoutConfig: this.getLayoutConfig(),
                        },
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

    private getLayoutConfig = () => {
        const { rtcUid, rtcUsers } = this.state;
        if (rtcUid === null || rtcUsers.length <= 0) {
            return [
                {
                    x_axis: 0,
                    y_axis: 0,
                    width: 1,
                    height: 1,
                    alpha: 1,
                    render_mode: 0,
                },
            ];
        }
        if (rtcUsers.length === 1) {
            return [
                {
                    x_axis: 0,
                    y_axis: 0,
                    width: 1,
                    height: 0.5,
                    alpha: 1,
                    render_mode: 0,
                },
                {
                    x_axis: 0,
                    y_axis: 0.5,
                    width: 1,
                    height: 0.5,
                    alpha: 1,
                    render_mode: 0,
                },
            ];
        }

        const result = [];
        for (let i = 0, len = Math.min(4, rtcUsers.length + 1); i < len; i++) {
            result.push({
                x_axis: i % 2 === 0 ? 0 : 0.5,
                y_axis: i < 2 ? 0 : 0.5,
                width: 0.5,
                height: 0.5,
                alpha: 1,
                render_mode: 0,
            });
        }
        return result;
    };

    private onUserJoined = (uid: number) => {
        this.setState(state => ({
            rtcUsers: [...new Set([...state.rtcUsers, uid])],
        }));
    };

    private onUserOffline = (uid: number) => {
        this.setState(state => ({
            rtcUsers: state.rtcUsers.filter(id => id !== uid),
        }));
    };

    private toggleCalling = async (): Promise<void> => {
        if (this.state.isCalling) {
            this.setState({ isCalling: false, rtcUsers: [] });
            if (this.cloudRecording?.isRecording) {
                await this.toggleRecording();
                if (this.cloudRecordingInterval) {
                    clearInterval(this.cloudRecordingInterval);
                }
            }
            this.rtc.rtcEngine.off("userjoined", this.onUserJoined);
            this.rtc.rtcEngine.off("userOffline", this.onUserOffline);
            this.rtc.leave();
        } else {
            this.setState({ isCalling: true, isRealtimeSideOpen: true });
            this.rtc.rtcEngine.on("userJoined", this.onUserJoined);
            this.rtc.rtcEngine.on("userOffline", this.onUserOffline);
            this.rtc.join(this.props.match.params.uuid);
        }
    };

    private openReplayPage = () => {
        // @TODO 打开到当前的录制记录中
        const { uuid, identity, userId } = this.props.match.params;
        this.props.history.push(`/replay/${identity}/${uuid}/${userId}/`);
    };

    public render(): React.ReactNode {
        const { room, phase } = this.state;

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
                return this.renderWhiteBoard(room);
            }
        }
    }

    private renderWhiteBoard(room: Room): React.ReactNode {
        const { uuid, userId, identity } = this.props.match.params;

        const {
            isMenuVisible,
            isFileOpen,
            whiteboardLayerDownRef,
            isRealtimeSideOpen,
            isCalling,
            rtcUid,
            rtcUsers,
        } = this.state;

        return (
            <div className="realtime-box">
                {this.renderTopBar(room)}
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
                                        whiteboardRef={whiteboardLayerDownRef}
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
                            <div ref={this.handleBindRoom} className="whiteboard-box" />
                        </OssDropUpload>
                    </div>
                    <RealtimePanel
                        isShow={isRealtimeSideOpen}
                        isVideoOn={isCalling}
                        onSwitch={this.handleSideOpenerSwitch}
                        videoSlot={
                            <VideoAvatars
                                localUid={rtcUid}
                                remoteUids={rtcUsers}
                                rtcEngine={this.rtc.rtcEngine}
                            />
                        }
                        chatSlot={
                            <ChatPanel
                                userId={userId}
                                channelId={uuid}
                                identity={identity}
                            ></ChatPanel>
                        }
                    />
                </div>
            </div>
        );
    }

    private renderTopBar(room: Room): React.ReactNode {
        const { isCalling, isRecording, recordingUuid } = this.state;
        const { uuid } = this.props.match.params;

        const topBarCenter = (
            <TopBarRecordStatus
                isRecording={isRecording}
                recordingUuid={recordingUuid}
                onStop={this.toggleRecording}
                onReplay={this.openReplayPage}
            />
        );

        const topBarRightBtns = (
            <>
                <TopBarRightBtn
                    title="Record"
                    icon="record"
                    active={isRecording}
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
                    active={this.state.mode === ViewMode.Broadcaster}
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
                <TopBarRightBtn title="Options" icon="options" onClick={() => {}} />
            </>
        );

        return <TopBar center={topBarCenter} rightBtns={topBarRightBtns} />;
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
