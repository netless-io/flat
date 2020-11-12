import moment from "moment";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import * as React from "react";
import { RouteComponentProps } from "react-router";
import classNames from "classnames";
import { message, Tooltip, Tabs } from "antd";

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
import { netlessToken, ossConfigObj } from "./appToken";
import { pptDatas } from "./taskUuids";
import { Identity } from "./IndexPage";
import { LocalStorageRoomDataType } from "./HistoryPage";
import PageError from "./PageError";
import LoadingPage from "./LoadingPage";

import InviteButton from "./components/InviteButton";
import ExitButtonRoom from "./components/ExitButtonRoom";
import { TopBar } from "./components/TopBar";
import { TopBarRightBtn } from "./components/TopBarRightBtn";

import { listDir } from "./utils/Fs";
import { runtime } from "./utils/Runtime";
import { ipcAsyncByMain } from "./utils/Ipc";

import pages from "./assets/image/pages.svg";
import topbarRecording from "./assets/image/topbar-recording.svg";
import topbarPlay from "./assets/image/topbar-play.svg";

import "./WhiteboardPage.less";

export type WhiteboardPageStates = {
    phase: RoomPhase;
    room?: Room;
    isMenuVisible: boolean;
    isFileOpen: boolean;
    isRecording: boolean;
    isCalling: boolean;
    isRealtimeSideOpen: boolean;
    recordData: any; // @TODO 添加录制数据类型
    mode?: ViewMode;
    whiteboardLayerDownRef?: HTMLDivElement;
    roomController?: ViewMode;
};

export type WhiteboardPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
}>;

export class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageStates> {
    private videoRef = React.createRef<HTMLDivElement>();

    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
            isMenuVisible: false,
            isFileOpen: false,
            isRecording: false,
            isCalling: false,
            isRealtimeSideOpen: false,
            recordData: null,
        };
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 800,
        });
    }

    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
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
    public setRoomList = (uuid: string, userId: string): void => {
        const rooms = localStorage.getItem("rooms");
        const timestamp = moment(new Date()).format("lll");
        if (rooms) {
            const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
            const room = roomArray.find(data => data.uuid === uuid);
            if (!room) {
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            userId: userId,
                        },
                        ...roomArray,
                    ]),
                );
            } else {
                const newRoomArray = roomArray.filter(data => data.uuid !== uuid);
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            userId: userId,
                        },
                        ...newRoomArray,
                    ]),
                );
            }
        } else {
            localStorage.setItem(
                "rooms",
                JSON.stringify([
                    {
                        uuid: uuid,
                        time: timestamp,
                        identity: Identity.creator,
                        userId: userId,
                    },
                ]),
            );
        }
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
        this.setRoomList(uuid, userId);
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
                    appIdentifier: netlessToken.appIdentifier,
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
                (window as any).room = room;
            }
        } catch (error) {
            message.error(error);
            console.log(error);
        }
    };

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

    private handleSideOpenerClick = (): void => {
        this.setState(state => ({ isRealtimeSideOpen: !state.isRealtimeSideOpen }));
    };

    public render(): React.ReactNode {
        const { room, phase } = this.state;

        if (room == null) {
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
        const {
            isMenuVisible,
            isFileOpen,
            isCalling,
            isRecording,
            recordData,
            whiteboardLayerDownRef,
        } = this.state;

        const { identity, uuid, userId } = this.props.match.params;

        const TopBarRightBtns = (
            <>
                <TopBarRightBtn
                    title="Record"
                    icon="record"
                    active={isRecording}
                    onClick={() => {
                        this.setState(state => ({
                            isRecording: !state.isRecording,
                        }));
                    }}
                />
                <TopBarRightBtn
                    title="Call"
                    icon="phone"
                    active={isCalling}
                    onClick={() => {
                        this.setState(state => ({
                            isCalling: !state.isCalling,
                        }));
                    }}
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
                <ExitButtonRoom identity={identity} room={room} userId={userId} />
            </>
        );

        const topBarCenter = (
            <div className="topbar-record-status">
                {isRecording ? (
                    <>
                        <span className="topbar-record-status">正在录制中…</span>
                        <span className="topbar-record-time-recording">00:38</span>
                        <button
                            className="topbar-record-btn"
                            onClick={() => this.setState({ isRecording: false })}
                        >
                            <img src={topbarRecording} alt="recording" />
                            <span>结束录制</span>
                        </button>
                    </>
                ) : recordData ? (
                    <>
                        <span className="topbar-record-status">录制完成</span>
                        <span className="topbar-record-time-recording">00:38</span>
                        <button className="topbar-record-btn">
                            <img src={topbarPlay} alt="play" />
                            <span>查看回放</span>
                        </button>
                    </>
                ) : null}
            </div>
        );

        return (
            <div className="realtime-box">
                <TopBar title="房间主题" center={topBarCenter} rightBtns={TopBarRightBtns} />
                <div className="realtime-content">
                    <div className="realtime-content-main">
                        <div className="tool-box-out">
                            <ToolBox
                                room={room}
                                customerComponent={[
                                    <OssUploadButton
                                        oss={ossConfigObj}
                                        appIdentifier={netlessToken.appIdentifier}
                                        sdkToken={netlessToken.sdkToken}
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
                        <OssDropUpload room={room} oss={ossConfigObj}>
                            <div ref={this.handleBindRoom} className="whiteboard-box" />
                        </OssDropUpload>
                    </div>
                    <div
                        className={classNames("realtime-content-side", {
                            isActive: this.state.isRealtimeSideOpen,
                        })}
                    >
                        <div className="realtime-content-side-container">
                            {this.state.isCalling && (
                                <div className="realtime-video" ref={this.videoRef}></div>
                            )}
                            <div className="realtime-messaging">
                                <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                                    {/* @TODO 实现列表 */}
                                    <Tabs.TabPane tab="消息列表" key="messages">
                                        Content of Tab Pane 1
                                    </Tabs.TabPane>
                                    <Tabs.TabPane tab="用户列表" key="users">
                                        Content of Tab Pane 2
                                    </Tabs.TabPane>
                                </Tabs>
                            </div>
                            <button
                                className="realtime-side-opener"
                                onClick={this.handleSideOpenerClick}
                            ></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default WhiteboardPage;
