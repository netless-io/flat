import { generateRTMToken } from "@netless/flat-server-api/src/agora";
import {
    IServiceTextChat,
    IServiceTextChatJoinRoomConfig,
    IServiceTextChatPeerCommand,
    IServiceTextChatPeerCommandData,
    IServiceTextChatPeerCommandNames,
    IServiceTextChatRoomCommand,
    IServiceTextChatRoomCommandData,
    IServiceTextChatRoomCommandNames,
} from "@netless/flat-services";
import RtmEngine, { RtmChannel, RtmClient, RtmMessage, RtmStatusCode } from "agora-rtm-sdk";
import { SideEffectManager } from "side-effect-manager";
import { v4 as uuidv4 } from "uuid";

export class AgoraRTM extends IServiceTextChat {
    public readonly members = new Set<string>();

    private readonly _encoder = new TextEncoder();
    private readonly _decoder = new TextDecoder();
    private readonly _sideEffect = new SideEffectManager();
    private readonly _roomSideEffect = new SideEffectManager();

    private _pJoiningRoom?: Promise<unknown>;
    private _pLeavingRoom?: Promise<unknown>;

    public readonly client: RtmClient;
    public channel?: RtmChannel;

    private roomUUID?: string;
    private userUUID?: string;
    private token?: string;

    public constructor(APP_ID: string) {
        super();
        if (!APP_ID) {
            throw new Error("APP_ID is not set");
        }
        this.client = RtmEngine.createInstance(APP_ID, {
            logFilter: RtmEngine.LOG_FILTER_WARNING,
        });
    }

    public override async destroy(): Promise<void> {
        super.destroy();

        this._sideEffect.flushAll();

        try {
            await this.leaveRoom();
            this.client.removeAllListeners();
        } catch (e) {
            console.error(e);
        }
    }

    public async joinRoom(config: IServiceTextChatJoinRoomConfig): Promise<void> {
        if (this._pJoiningRoom) {
            await this._pJoiningRoom;
        }
        if (this._pLeavingRoom) {
            await this._pLeavingRoom;
        }

        if (this.channel) {
            if (this.roomUUID === config.roomUUID) {
                return;
            }
            await this.leaveRoom();
        }

        this._pJoiningRoom = this._joinRoom(config);
        await this._pJoiningRoom;
        this._pJoiningRoom = undefined;
    }

    public async leaveRoom(): Promise<void> {
        if (this._pJoiningRoom) {
            await this._pJoiningRoom;
        }
        if (this._pLeavingRoom) {
            await this._pLeavingRoom;
        }

        if (this.channel) {
            this._roomSideEffect.flushAll();

            this._pLeavingRoom = this._leaveRoom(this.channel);
            await this._pLeavingRoom;
            this._pLeavingRoom = undefined;

            this.channel = undefined;
            this.token = undefined;
        }

        this.roomUUID = undefined;
        this.userUUID = undefined;
        this.members.clear();
    }

    public async sendRoomMessage(message: string): Promise<void> {
        if (this.channel) {
            await this.channel.sendMessage(
                {
                    messageType: RtmEngine.MessageType.TEXT,
                    text: message,
                },
                // @ts-ignore
                { enableHistoricalMessaging: true },
            );
            // emit to local
            if (this.roomUUID && this.userUUID) {
                this.events.emit("room-message", {
                    uuid: uuidv4(),
                    roomUUID: this.roomUUID,
                    text: message,
                    senderID: this.userUUID,
                    timestamp: Date.now(),
                });
            }
        } else {
            if (process.env.NODE_ENV === "development") {
                console.error("sendRoomMessage: channel is not ready");
            }
        }
    }

    public async sendRoomCommand<TName extends IServiceTextChatRoomCommandNames>(
        t: TName,
        v: IServiceTextChatRoomCommandData[TName],
    ): Promise<void> {
        if (this.channel) {
            const command = { t, v } as IServiceTextChatRoomCommand;
            await this.channel.sendMessage({
                messageType: RtmEngine.MessageType.RAW,
                rawMessage: this._encoder.encode(JSON.stringify(command)),
            });
            // emit to local
            if (this.roomUUID && this.userUUID) {
                this._emitRoomCommand(this.roomUUID, this.userUUID, command);
            }
        } else {
            if (process.env.NODE_ENV === "development") {
                console.error("sendCommand: channel is not ready");
            }
        }
    }

    public async sendPeerMessage(message: string, peerID: string): Promise<boolean> {
        if (this.channel) {
            const result = await this.client.sendMessageToPeer({ text: message }, peerID);
            return result.hasPeerReceived;
        } else {
            if (process.env.NODE_ENV === "development") {
                console.error("sendPeerMessage: channel is not ready");
            }
            return false;
        }
    }

    public async sendPeerCommand<TName extends IServiceTextChatPeerCommandNames>(
        t: TName,
        v: IServiceTextChatPeerCommandData[TName],
        peerID: string,
    ): Promise<boolean> {
        if (this.channel) {
            const result = await this.client.sendMessageToPeer(
                {
                    messageType: RtmEngine.MessageType.RAW,
                    rawMessage: this._encoder.encode(JSON.stringify({ t, v })),
                },
                peerID,
            );
            return result.hasPeerReceived;
        } else {
            if (process.env.NODE_ENV === "development") {
                console.error("sendPeerMessage: channel is not ready");
            }
            return false;
        }
    }

    private async _joinRoom({
        uid,
        token,
        roomUUID,
        ownerUUID,
    }: IServiceTextChatJoinRoomConfig): Promise<void> {
        this.token = token || (await generateRTMToken());

        if (!this.token) {
            throw new Error("Missing Agora RTM token");
        }

        this._roomSideEffect.add(() => {
            const handler = async (): Promise<void> => {
                this.token = await generateRTMToken();
                await this.client.renewToken(this.token);
            };
            this.client.on("TokenExpired", handler);
            return () => this.client.off("TokenExpired", handler);
        });

        this._roomSideEffect.add(() => {
            const handler = (
                _state: RtmStatusCode.ConnectionState,
                reason: RtmStatusCode.ConnectionChangeReason,
            ): void => {
                if (reason === RtmEngine.ConnectionChangeReason.REMOTE_LOGIN) {
                    this.events.emit("remote-login", { roomUUID });
                }
            };
            this.client.on("ConnectionStateChanged", handler);
            return () => this.client.off("ConnectionStateChanged", handler);
        });

        await this.client.login({ uid, token: this.token });

        const channel = this.client.createChannel(roomUUID);
        this.channel = channel;

        this._roomSideEffect.add(() => {
            const handler = (msg: RtmMessage, senderID: string): void => {
                switch (msg.messageType) {
                    case RtmEngine.MessageType.TEXT: {
                        this.events.emit(
                            senderID === "flat-server" ? "admin-message" : "room-message",
                            {
                                uuid: uuidv4(),
                                roomUUID,
                                text: msg.text,
                                senderID,
                                timestamp: Date.now(),
                            },
                        );
                        break;
                    }
                    case RtmEngine.MessageType.RAW: {
                        try {
                            const command = JSON.parse(
                                this._decoder.decode(msg.rawMessage),
                            ) as IServiceTextChatRoomCommand;
                            if (senderID === ownerUUID || command.t === "enter") {
                                this._emitRoomCommand(roomUUID, senderID, command);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                        break;
                    }
                }
            };
            channel.on("ChannelMessage", handler);
            return () => channel.off("ChannelMessage", handler);
        });

        this._roomSideEffect.add(() => {
            const handler = (msg: RtmMessage, senderID: string): void => {
                if (msg.messageType === RtmEngine.MessageType.RAW) {
                    try {
                        const command = JSON.parse(
                            this._decoder.decode(msg.rawMessage),
                        ) as IServiceTextChatPeerCommand;
                        if (command.v.roomUUID !== roomUUID) {
                            return;
                        }
                        switch (command.t) {
                            case "raise-hand": {
                                this.events.emit("raise-hand", {
                                    roomUUID,
                                    userUUID: senderID,
                                    raiseHand: command.v.raiseHand,
                                });
                                break;
                            }
                            case "request-device": {
                                this.events.emit("request-device", {
                                    roomUUID,
                                    senderID,
                                    deviceState: command.v,
                                });
                                break;
                            }
                            case "request-device-response": {
                                this.events.emit("request-device-response", {
                                    roomUUID,
                                    userUUID: senderID,
                                    deviceState: command.v,
                                });
                                break;
                            }
                            case "notify-device-off": {
                                this.events.emit("notify-device-off", {
                                    roomUUID,
                                    senderID,
                                    deviceState: command.v,
                                });
                                break;
                            }
                            case "users-info": {
                                this.events.emit("users-info", {
                                    roomUUID,
                                    userUUID: senderID,
                                    users: command.v.users,
                                });
                                break;
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            };
            this.client.on("MessageFromPeer", handler);
            return () => this.client.off("MessageFromPeer", handler);
        });

        await channel.join();

        (await channel.getMembers()).forEach(userUUID => {
            this.members.add(userUUID);
        });
        this._roomSideEffect.add(() => {
            const onMemberJoin = (userUUID: string): void => {
                this.members.add(userUUID);
                this.events.emit("member-joined", { roomUUID, userUUID });
            };
            const onMemberLeave = (userUUID: string): void => {
                this.members.delete(userUUID);
                this.events.emit("member-left", { roomUUID, userUUID });
            };
            channel.on("MemberJoined", onMemberJoin);
            channel.on("MemberLeft", onMemberLeave);
            return () => {
                channel.off("MemberJoined", onMemberJoin);
                channel.off("MemberLeft", onMemberLeave);
            };
        });

        this.roomUUID = roomUUID;
        this.userUUID = uid;
    }

    private async _leaveRoom(channel: RtmChannel): Promise<void> {
        channel.removeAllListeners();
        await channel.leave();
        await this.client.logout();
    }

    private _emitRoomCommand(
        roomUUID: string,
        ownerUUID: string,
        command: IServiceTextChatRoomCommand,
    ): void {
        switch (command.t) {
            case "ban": {
                this.events.emit("ban", {
                    uuid: uuidv4(),
                    roomUUID,
                    status: command.v.status,
                    senderID: ownerUUID,
                    timestamp: Date.now(),
                });
                break;
            }
            case "notice": {
                this.events.emit("notice", {
                    uuid: uuidv4(),
                    roomUUID,
                    text: command.v.text,
                    senderID: ownerUUID,
                    timestamp: Date.now(),
                });
                break;
            }
            case "update-room-status": {
                this.events.emit("update-room-status", {
                    roomUUID,
                    status: command.v.status,
                    senderID: ownerUUID,
                });
                break;
            }
            case "reward": {
                this.events.emit("reward", {
                    roomUUID,
                    userUUID: command.v.userUUID,
                    senderID: ownerUUID,
                });
                break;
            }
            case "enter": {
                this.events.emit("enter", {
                    roomUUID,
                    userUUID: command.v.userUUID,
                    userInfo: command.v.userInfo,
                    peers: command.v.peers,
                });
                break;
            }
        }
    }
}
