import {
    IServiceTextChat,
    IServiceTextChatJoinRoomConfig,
    IServiceTextChatPeerCommand,
    IServiceTextChatPeerCommandData,
    IServiceTextChatRoomCommand,
    IServiceTextChatRoomCommandData,
} from "@netless/flat-services";
import AgoraRTM, { RTMClient, RTMEvents } from "agora-rtm";
import { v4 as uuidv4 } from "uuid";
import { generateRTMToken } from "@netless/flat-server-api";

const { RTM } = AgoraRTM;

export class AgoraRTM2 extends IServiceTextChat {
    public readonly members = new Set<string>();

    private readonly _encoder = new TextEncoder();
    private readonly _decoder = new TextDecoder();

    private _pJoiningRoom?: Promise<unknown>;
    private _pLeavingRoom?: Promise<unknown>;

    public client?: RTMClient;
    public channel?: string;

    private roomUUID?: string;
    private userUUID?: string;
    private token?: string;

    public constructor(private readonly APP_ID: string) {
        super();
        if (!APP_ID) {
            throw new Error("APP_ID is not set");
        }
    }

    public override async destroy(): Promise<void> {
        super.destroy();

        try {
            await this.leaveRoom();
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

        if (this.client) {
            if (this.channel === config.roomUUID) {
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
            this.sideEffect.flushAll();
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
        if (this.client && this.channel) {
            await this.client.publish(this.channel, message);
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

    public async sendRoomCommand<TName extends keyof IServiceTextChatRoomCommandData>(
        t: TName,
        v: IServiceTextChatRoomCommandData[TName],
    ): Promise<void> {
        if (this.client && this.channel) {
            const command = { t, v } as IServiceTextChatRoomCommand;
            await this.client.publish(this.channel, this._encoder.encode(JSON.stringify(command)));
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
        if (this.client && this.channel) {
            await this.client.publish(peerID, message, { channelType: "USER" });
            return true;
        } else {
            if (process.env.NODE_ENV === "development") {
                console.error("sendPeerMessage: channel is not ready");
            }
            return false;
        }
    }

    public async sendPeerCommand<TName extends keyof IServiceTextChatPeerCommandData>(
        t: TName,
        v: IServiceTextChatPeerCommandData[TName],
        peerID: string,
    ): Promise<boolean> {
        if (this.client && this.channel) {
            const command = { t, v } as IServiceTextChatPeerCommand;
            await this.client.publish(peerID, this._encoder.encode(JSON.stringify(command)), {
                channelType: "USER",
            });
            return true;
        } else {
            if (process.env.NODE_ENV === "development") {
                console.error("sendPeerCommand: channel is not ready");
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

        const client = (this.client = new RTM(this.APP_ID, uid, {
            logLevel: "warn",
            logUpload: !process.env.DEV,
            token: this.token,
        }));

        this.sideEffect.add(() => {
            const handler = async (): Promise<void> => {
                this.token = await generateRTMToken();
                await client.renewToken(this.token);
            };
            client.addEventListener("tokenPrivilegeWillExpire", handler);
            return () => client.removeEventListener("tokenPrivilegeWillExpire", handler);
        });

        this.sideEffect.add(() => {
            type StatusChangeEvent =
                | RTMEvents.RTMConnectionStatusChangeEvent
                | RTMEvents.StreamChannelConnectionStatusChangeEvent;
            const handler = ({ reason }: StatusChangeEvent): void => {
                if (reason === "SAME_UID_LOGIN") {
                    this.events.emit("remote-login", { roomUUID });
                }
            };
            client.addEventListener("status", handler);
            return () => client.removeEventListener("status", handler);
        });

        this.sideEffect.add(() => {
            const handleRoomMessage = (msg: RTMEvents.MessageEvent): void => {
                switch (msg.messageType) {
                    case "STRING": {
                        this.events.emit(
                            msg.publisher === "flat-server" ? "admin-message" : "room-message",
                            {
                                uuid: uuidv4(),
                                roomUUID,
                                text: msg.message as string,
                                senderID: msg.publisher,
                                timestamp: Date.now(),
                            },
                        );
                        break;
                    }
                    case "BINARY": {
                        try {
                            const command = JSON.parse(
                                this._decoder.decode(msg.message as Uint8Array),
                            ) as IServiceTextChatRoomCommand;
                            if (msg.publisher === ownerUUID || command.t === "enter") {
                                this._emitRoomCommand(roomUUID, msg.publisher, command);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            };

            const handlePeerMessage = (msg: RTMEvents.MessageEvent): void => {
                if (msg.messageType === "BINARY") {
                    try {
                        const command = JSON.parse(
                            this._decoder.decode(msg.message as Uint8Array),
                        ) as IServiceTextChatPeerCommand;
                        if (command.v.roomUUID !== roomUUID) {
                            return;
                        }
                        switch (command.t) {
                            case "raise-hand": {
                                this.events.emit("raise-hand", {
                                    roomUUID,
                                    userUUID: msg.publisher,
                                    raiseHand: command.v.raiseHand,
                                });
                                break;
                            }
                            case "request-device": {
                                this.events.emit("request-device", {
                                    roomUUID,
                                    senderID: msg.publisher,
                                    deviceState: command.v,
                                });
                                break;
                            }
                            case "request-device-response": {
                                this.events.emit("request-device-response", {
                                    roomUUID,
                                    userUUID: msg.publisher,
                                    deviceState: command.v,
                                });
                                break;
                            }
                            case "notify-device-off": {
                                this.events.emit("notify-device-off", {
                                    roomUUID,
                                    senderID: msg.publisher,
                                    deviceState: command.v,
                                });
                                break;
                            }
                            case "users-info": {
                                this.events.emit("users-info", {
                                    roomUUID,
                                    userUUID: msg.publisher,
                                    users: command.v.users,
                                });
                                break;
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    console.log("Ignored peer message:", msg.message);
                }
            };

            const handler = (msg: RTMEvents.MessageEvent): void => {
                console.log("[rtm2] message", msg);

                if (msg.channelName === roomUUID) {
                    handleRoomMessage(msg);
                } else if (msg.channelName === uid) {
                    handlePeerMessage(msg);
                } else {
                    console.warn("Message from unknown channel:", msg.channelName, msg.message);
                }
            };

            client.addEventListener("message", handler);
            return () => client.removeEventListener("message", handler);
        });

        await client.login();
        await client.subscribe(roomUUID, {
            withMessage: true,
            withPresence: true,
        });
        await client.subscribe(uid, {
            withMessage: true,
        });
        this.channel = roomUUID;

        await this._initMembers(client, roomUUID);

        this.sideEffect.add(() => {
            const handler = (event: RTMEvents.PresenceEvent): void => {
                console.log(JSON.stringify(event, null, 2));

                if (event.eventType === "REMOTE_JOIN") {
                    this.members.add(event.publisher);
                    this.events.emit("member-joined", { roomUUID, userUUID: event.publisher });
                } else if (event.eventType === "REMOTE_LEAVE") {
                    this.members.delete(event.publisher);
                    this.events.emit("member-left", { roomUUID, userUUID: event.publisher });
                } else if (event.eventType === "REMOTE_TIMEOUT") {
                    this.members.delete(event.publisher);
                    this.events.emit("member-left", { roomUUID, userUUID: event.publisher });
                }

                // When the user list exceeds Announce Max (default to 50), it will aggregate
                // the events and send them in the "interval" field.
                if (event.interval) {
                    const { join, leave, timeout } = event.interval;
                    join.users.forEach(user => {
                        this.members.add(user);
                        this.events.emit("member-joined", { roomUUID, userUUID: user });
                    });
                    leave.users.forEach(user => {
                        this.members.delete(user);
                        this.events.emit("member-left", { roomUUID, userUUID: user });
                    });
                    timeout.users.forEach(user => {
                        this.members.delete(user);
                        this.events.emit("member-left", { roomUUID, userUUID: user });
                    });
                }
            };
            client.addEventListener("presence", handler);
            return () => client.removeEventListener("presence", handler);
        });

        this.roomUUID = roomUUID;
        this.userUUID = uid;
    }

    private async _leaveRoom(channel: string): Promise<void> {
        const { client } = this;
        if (client) {
            client.removeAllListeners();
            if (this.userUUID) {
                await client.unsubscribe(this.userUUID);
            }
            await client.unsubscribe(channel);
            await client.logout();
        }
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

    private async _initMembers(client: RTMClient, roomUUID: string): Promise<void> {
        let page: string | undefined;
        do {
            const result = await client.presence.whoNow(roomUUID, "MESSAGE", {
                includedUserId: true,
                page,
            });
            const { occupants, nextPage } = result;
            occupants.forEach(user => this.members.add(user.userId));
            page = nextPage;
        } while (page);
        if (process.env.DEV) {
            console.log("[rtm2] members.size after init:", this.members.size);
        }
    }
}
