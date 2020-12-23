import React from "react";
import { RouteComponentProps } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { message } from "antd";
import { createPlugins, Room, RoomPhase, RoomState, ViewMode, WhiteWebSdk } from "white-web-sdk";

import ToolBox from "@netless/tool-box";
import RedoUndo from "@netless/redo-undo";
import PageController from "@netless/page-controller";
import ZoomController from "@netless/zoom-controller";
import OssUploadButton from "@netless/oss-upload-button";
import PreviewController from "@netless/preview-controller";
import DocsCenter from "@netless/docs-center";
import OssDropUpload from "@netless/oss-drop-upload";
import { videoPlugin } from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import { CursorTool } from "@netless/cursor-tool";
import { PPTDataType, PPTType } from "@netless/oss-upload-manager";

import { netlessWhiteboardApi } from "../apiMiddleware";
import { pptDatas } from "../taskUuids";
import { NETLESS, NODE_ENV, OSS } from "../constants/Process";
import { Identity } from "../utils/localStorage/room";

import pages from "../assets/image/pages.svg";
import "./Whiteboard.less";

export interface WhiteboardRenderProps {
    phase: RoomPhase;
    room?: Room;
    viewMode?: ViewMode;
    whiteboardElement: React.ReactNode;
    toggleDocCenter: () => void;
}

export interface WhiteboardProps {
    children: (props: WhiteboardRenderProps) => React.ReactNode;
    roomId: string;
    userId: string;
    identity: Identity;
}

export interface WhiteboardState {
    isShowPreviewPanel: boolean;
    isFileOpen: boolean;
    phase: RoomPhase;
    room?: Room;
    viewMode?: ViewMode;
    whiteboardRef?: HTMLDivElement;
}

export class Whiteboard extends React.Component<WhiteboardProps, WhiteboardState> {
    private ossConfig = {
        accessKeyId: OSS.ACCESS_KEY_ID,
        accessKeySecret: OSS.ACCESS_KEY_SECRET!,
        region: OSS.REGION!,
        bucket: OSS.BUCKET!,
        folder: OSS.FOLDER!,
        prefix: OSS.PREFIX!,
    };

    state: WhiteboardState = {
        isShowPreviewPanel: false,
        isFileOpen: false,
        phase: RoomPhase.Connecting,
    };

    async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
    }

    async componentWillUnmount(): Promise<void> {
        if (this.state.room) {
            this.state.room.callbacks.off();
        }

        if (NODE_ENV === "development") {
            (window as any).room = null;
        }
    }

    renderWhiteboard = (): React.ReactNode => {
        const { room, whiteboardRef, isShowPreviewPanel, isFileOpen } = this.state;
        if (!room) {
            return null;
        }

        return (
            <div className="whiteboard-container">
                <div className="tool-box-out">
                    <ToolBox
                        room={room}
                        customerComponent={[
                            <OssUploadButton
                                oss={this.ossConfig}
                                appIdentifier={NETLESS.APP_IDENTIFIER}
                                sdkToken={NETLESS.SDK_TOKEN}
                                room={room}
                                whiteboardRef={whiteboardRef}
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
                        <div
                            className="page-controller-cell"
                            onClick={() => this.handlePreviewState(true)}
                        >
                            <img src={pages} alt={"pages"} />
                        </div>
                        <PageController room={room} />
                    </div>
                </div>
                <PreviewController
                    handlePreviewState={this.handlePreviewState}
                    isVisible={isShowPreviewPanel}
                    room={room}
                />
                <DocsCenter
                    handleDocCenterState={this.handleDocCenterState}
                    isFileOpen={isFileOpen}
                    room={room}
                />
                <OssDropUpload room={room} oss={this.ossConfig}>
                    <div ref={this.handleBindRoom} className="whiteboard-box" />
                </OssDropUpload>
            </div>
        );
    };

    render(): React.ReactNode {
        const { phase, room, viewMode } = this.state;

        return this.props.children({
            phase,
            room,
            viewMode,
            whiteboardElement: this.renderWhiteboard(),
            toggleDocCenter: this.toggleDocCenter,
        });
    }

    private handleBindRoom = (ref: HTMLDivElement): void => {
        const { room } = this.state;
        this.setState({ whiteboardRef: ref });
        if (room) {
            room.bindHtmlElement(ref);
        }
    };

    private handlePreviewState = (state: boolean): void => {
        this.setState({ isShowPreviewPanel: state });
    };

    private handleDocCenterState = (state: boolean): void => {
        this.setState({ isFileOpen: state });
    };

    private toggleDocCenter = (): void => {
        this.setState(state => ({ isFileOpen: !state.isFileOpen }));
    };

    private startJoinRoom = async (): Promise<void> => {
        const { roomId, userId, identity } = this.props;
        try {
            const roomToken = await this.getRoomToken(roomId);
            if (roomId && roomToken) {
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
                        uuid: roomId,
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
                                this.setState({ viewMode: modifyState.broadcastState.mode });
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
                    this.setState({ viewMode: room.state.broadcastState.mode });
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

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (roomToken) {
            return roomToken;
        } else {
            return null;
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
}

export type WithWhiteboardRouteProps = { whiteboard: WhiteboardRenderProps } & RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
}>;

export function withWhiteboardRoute<Props>(
    Comp: React.ComponentType<Props & WithWhiteboardRouteProps>,
) {
    return class withWhiteboardRoute extends React.Component<
        Props & Omit<WithWhiteboardRouteProps, "whiteboard">
    > {
        render() {
            const { uuid, userId, identity } = this.props.match.params;
            return (
                <Whiteboard roomId={uuid} userId={userId} identity={identity}>
                    {this.renderChildren}
                </Whiteboard>
            );
        }

        renderChildren = (props: WhiteboardRenderProps) => (
            <Comp {...this.props} whiteboard={props} />
        );
    };
}
