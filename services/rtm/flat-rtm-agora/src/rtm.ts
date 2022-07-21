import {
    FlatRTM,
    FlatRTMJoinRoomConfig,
    FlatRTMRoomCommandNames,
    FlatRTMRoomCommandData,
    FlatRTMPeerCommandNames,
    FlatRTMPeerCommandData,
    FlatRTMRoomCommand,
    FlatRTMPeerCommand,
} from "@netless/flat-rtm";
import AgoraRTM, { RtmChannel, RtmClient, RtmMessage, RtmStatusCode } from "agora-rtm-sdk";
import { SideEffectManager } from "side-effect-manager";
import { v4 as uuidv4 } from "uuid";

export class FlatRTMAgora extends FlatRTM {
    public static APP_ID?: string;

    private static _instance?: FlatRTMAgora;

    public static getInstance(): FlatRTMAgora {
        return (FlatRTMAgora._instance ??= new FlatRTMAgora());
    }

    public readonly members = new Set<string>();

    private readonly _sideEffect = new SideEffectManager();
    private readonly _roomSideEffect = new SideEffectManager();

    private _pJoiningRoom?: Promise<unknown>;
    private _pLeavingRoom?: Promise<unknown>;

    private _client?: RtmClient;
    public get client(): RtmClient {
        if (!this._client) {
            if (!FlatRTMAgora.APP_ID) {
                throw new Error("APP_ID is not set");
            }
            this._client = AgoraRTM.createInstance(FlatRTMAgora.APP_ID, {
                logFilter: AgoraRTM.LOG_FILTER_WARNING,
            });
        }
        return this._client;
    }
    public channel?: RtmChannel;

    private roomUUID?: string;
    private userUUID?: string;
    private token?: string;

    public constructor() {
        super();
        if (process.env.DEV) {
            (window as any).rtm_client = this.client;
        }
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

    public async joinRoom(config: FlatRTMJoinRoomConfig): Promise<void> {
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
                    messageType: AgoraRTM.MessageType.TEXT,
                    text: message,
                },
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

    public async sendRoomCommand<TName extends FlatRTMRoomCommandNames>(
        t: TName,
        v: FlatRTMRoomCommandData[TName],
    ): Promise<void> {
        if (this.channel) {
            const command = { t, v } as FlatRTMRoomCommand;
            await this.channel.sendMessage({
                messageType: AgoraRTM.MessageType.RAW,
                rawMessage: new TextEncoder().encode(JSON.stringify(command)),
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

    public async sendPeerCommand<TName extends FlatRTMPeerCommandNames>(
        t: TName,
        v: FlatRTMPeerCommandData[TName],
        peerID: string,
    ): Promise<boolean> {
        if (this.channel) {
            const result = await this.client.sendMessageToPeer(
                {
                    messageType: AgoraRTM.MessageType.RAW,
                    rawMessage: new TextEncoder().encode(JSON.stringify({ t, v })),
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
        refreshToken,
        roomUUID,
        ownerUUID,
    }: FlatRTMJoinRoomConfig): Promise<void> {
        if (!FlatRTMAgora.APP_ID) {
            throw new Error("APP_ID is not set");
        }

        this.token = token || (await refreshToken?.(roomUUID));

        if (!this.token) {
            throw new Error("Missing Agora RTM token");
        }

        if (refreshToken) {
            this._roomSideEffect.add(() => {
                const handler = async (): Promise<void> => {
                    this.token = await refreshToken(roomUUID);
                    await this.client.renewToken(this.token);
                };
                this.client.on("TokenExpired", handler);
                return () => this.client.off("TokenExpired", handler);
            });
        }

        this._roomSideEffect.add(() => {
            const handler = (
                _state: RtmStatusCode.ConnectionState,
                reason: RtmStatusCode.ConnectionChangeReason,
            ): void => {
                if (reason === AgoraRTM.ConnectionChangeReason.REMOTE_LOGIN) {
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
                    case AgoraRTM.MessageType.TEXT: {
                        this.events.emit("room-message", {
                            uuid: uuidv4(),
                            roomUUID,
                            text: msg.text,
                            senderID,
                            timestamp: Date.now(),
                        });
                        break;
                    }
                    case AgoraRTM.MessageType.RAW: {
                        if (senderID === ownerUUID) {
                            try {
                                const command = JSON.parse(
                                    new TextDecoder().decode(msg.rawMessage),
                                ) as FlatRTMRoomCommand;
                                this._emitRoomCommand(roomUUID, senderID, command);
                            } catch (e) {
                                console.error(e);
                            }
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
                if (msg.messageType === AgoraRTM.MessageType.RAW) {
                    try {
                        const command = JSON.parse(
                            new TextDecoder().decode(msg.rawMessage),
                        ) as FlatRTMPeerCommand;
                        if (command.v.roomUUID !== roomUUID) {
                            return;
                        }
                        switch (command.t) {
                            case "raise-hand": {
                                this.events.emit("raise-hand", {
                                    roomUUID,
                                    userUUID: senderID,
                                });
                                break;
                            }
                            case "on-stage": {
                                this.events.emit("on-stage", {
                                    roomUUID,
                                    onStage: command.v.onStage,
                                    senderID,
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
        command: FlatRTMRoomCommand,
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
        }
    }
}
