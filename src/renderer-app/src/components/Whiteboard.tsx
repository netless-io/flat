import React from "react";
import { v4 as uuidv4 } from "uuid";
import { message } from "antd";
import { createPlugins, Room, RoomPhase, RoomState, ViewMode, WhiteWebSdk } from "white-web-sdk";

import { videoPlugin } from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import { CursorTool } from "@netless/cursor-tool";
import { PPTDataType, PPTType } from "@netless/oss-upload-manager";

import { netlessWhiteboardApi } from "../apiMiddleware";
import { pptDatas } from "../taskUuids";
import { NETLESS, NODE_ENV } from "../constants/Process";
import { Identity } from "../utils/localStorage/room";

export interface WhiteboardRenderProps {
    phase: RoomPhase;
    handleBindRoom: (ref: HTMLDivElement) => void;
    room?: Room;
    viewMode?: ViewMode;
    whiteboardRef?: HTMLDivElement;
}

export interface WhiteboardProps {
    children: (props: WhiteboardRenderProps) => React.ReactNode;
    roomId: string;
    userId: string;
    identity: Identity;
}

export type WhiteboardState = WhiteboardRenderProps;

export class Whiteboard extends React.Component<WhiteboardProps, WhiteboardState> {
    state: WhiteboardState = {
        phase: RoomPhase.Connecting,
        handleBindRoom: (ref: HTMLDivElement): void => {
            const { room } = this.state;
            this.setState({ whiteboardRef: ref });
            if (room) {
                room.bindHtmlElement(ref);
            }
        },
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

    render(): React.ReactNode {
        return this.props.children(this.state);
    }

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

export type WithWhiteboardProps = { whiteboard: WhiteboardRenderProps } & Omit<
    WhiteboardProps,
    "children"
>;

export function withWhiteboard<Props>(Comp: React.ComponentType<Props>) {
    return class WithWhiteboard extends React.Component<Props & Omit<WhiteboardProps, "children">> {
        render() {
            const { roomId, userId, identity } = this.props;
            return (
                <Whiteboard roomId={roomId} userId={userId} identity={identity}>
                    {this.renderWhiteboard}
                </Whiteboard>
            );
        }

        private renderWhiteboard = (props: WhiteboardRenderProps) => (
            <Comp {...this.props} whiteboard={props} />
        );
    };
}
