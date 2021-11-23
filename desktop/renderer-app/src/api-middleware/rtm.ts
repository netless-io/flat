import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import polly from "polly-js";
import { v4 as uuidv4 } from "uuid";
import { AGORA, NODE_ENV } from "../constants/process";
import { EventEmitter } from "events";
import { RoomStatus } from "./flatServer/constants";
import { generateRTMToken } from "./flatServer/agora";
import { globalStore } from "../stores/global-store";

export interface RtmRESTfulQueryPayload {
    filter: {
        source?: string;
        destination?: string;
        start_time: string;
        end_time: string;
    };
    offset?: number;
    limit?: number;
    order?: string;
}

export interface RtmRESTfulQueryResponse {
    result: string;
    offset: number;
    limit: number;
    order: string;
    location: string;
}

export interface RtmRESTfulQueryResourceResponse {
    code: string;
    messages: Array<{
        dst: string;
        message_type: string;
        ms: number;
        payload: string;
        src: string;
    }>;
    request_id: string;
    result: string;
}

export enum ClassModeType {
    Lecture = "Lecture",
    Interaction = "Interaction",
}

export enum NonDefaultUserProp {
    IsSpeak = "S",
    IsRaiseHand = "R",
    Camera = "C",
    Mic = "M",
}

export enum RTMessageType {
    /** group message */
    ChannelMessage = "ChannelMessage",
    /** a notice message */
    Notice = "Notice",
    /** A joiner raises hand */
    RaiseHand = "RaiseHand",
    /** creator accept hand raising from a joiner */
    AcceptRaiseHand = "AcceptRaiseHand",
    /** creator cancel all hand raising */
    CancelAllHandRaising = "CancelHandRaising",
    /** creator ban all rtm */
    BanText = "BanText",
    /** creator allows a joiner or joiners allows themselves to speak */
    Speak = "Speak",
    /**
     * joiner updates own camera and mic state
     * creator may turn off joiner's camera and mic but not turn on
     */
    DeviceState = "DeviceState",
    /** creator updates class mode */
    ClassMode = "ClassMode",
    /** creator updates class status */
    RoomStatus = "RoomStatus",
    /** joiner request room's status */
    RequestChannelStatus = "RequestChannelStatus",
    /** send room's status */
    ChannelStatus = "ChannelStatus",
    /** user login on other device */
    REMOTE_LOGIN = "REMOTE_LOGIN",
}

export type RTMEvents = {
    [RTMessageType.ChannelMessage]: string;
    [RTMessageType.Notice]: string;
    [RTMessageType.RaiseHand]: boolean;
    [RTMessageType.AcceptRaiseHand]: { userUUID: string; accept: boolean };
    [RTMessageType.CancelAllHandRaising]: boolean;
    [RTMessageType.BanText]: boolean;
    [RTMessageType.Speak]: Array<{ userUUID: string; speak: boolean }>;
    [RTMessageType.DeviceState]: { userUUID: string; camera: boolean; mic: boolean };
    [RTMessageType.ClassMode]: ClassModeType;
    [RTMessageType.RoomStatus]: RoomStatus;
    [RTMessageType.RequestChannelStatus]: {
        roomUUID: string;
        /** these users should response */
        userUUIDs: string[];
        /** also inform others about current user states */
        user: {
            name: string;
            camera: boolean;
            mic: boolean;
            /** this filed is only accepted from room creator */
            isSpeak: boolean;
        };
    };
    [RTMessageType.ChannelStatus]: {
        /** ban messaging */
        ban: boolean;
        /** room status */
        rStatus: RoomStatus;
        /** class mode type */
        rMode: ClassModeType;
        /** users with non-default states */
        uStates: {
            [uuid: string]: `${NonDefaultUserProp | ""}${NonDefaultUserProp | ""}${
                | NonDefaultUserProp
                | ""}${NonDefaultUserProp | ""}`;
        };
    };
    [RTMessageType.REMOTE_LOGIN]: void;
};

export interface RTMessage<U extends keyof RTMEvents = keyof RTMEvents> {
    type: U;
    value: RTMEvents[U];
    uuid: string;
    timestamp: number;
    userUUID: string;
}

export declare interface Rtm {
    on<U extends keyof RTMEvents>(
        event: U,
        listener: (value: RTMEvents[U], senderId: string) => void,
    ): this;
    once<U extends keyof RTMEvents>(
        event: U,
        listener: (value: RTMEvents[U], senderId: string) => void,
    ): this;
}

// eslint-disable-next-line no-redeclare
export class Rtm extends EventEmitter {
    public static MessageType = AgoraRTM.MessageType;

    public client: RtmClient;
    public channel?: RtmChannel;
    /** Channel for commands */
    public commands?: RtmChannel;
    public token?: string;

    private channelID: string | null = null;
    private commandsID: string | null = null;

    public constructor() {
        super();

        if (!AGORA.APP_ID) {
            throw new Error("Agora App Id not set.");
        }
        this.client = AgoraRTM.createInstance(AGORA.APP_ID, {
            logFilter: AgoraRTM.LOG_FILTER_WARNING,
        });
        this.client.on("TokenExpired", async () => {
            this.token = await generateRTMToken();
            await this.client.renewToken(this.token);
        });
        this.client.on("ConnectionStateChanged", (newState, reason) => {
            if (reason === "REMOTE_LOGIN") {
                this.emit(RTMessageType.REMOTE_LOGIN);
            }
            console.log("RTM client state: ", newState, reason);
        });
        this.client.on("MessageFromPeer", (msg, senderId) => {
            if (msg.messageType === AgoraRTM.MessageType.TEXT) {
                try {
                    const { r, t, v } = JSON.parse(msg.text);
                    if (r === this.commandsID && t) {
                        this.emit(t, v, senderId);
                        if (NODE_ENV === "development") {
                            console.log(`[RTM] Received p2p command from ${senderId}: `, t, v);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
    }

    public async init(userUUID: string, channelID: string): Promise<RtmChannel> {
        if (this.channel) {
            if (this.channelID === channelID) {
                return this.channel;
            } else {
                await this.destroy();
            }
        }

        this.channelID = channelID;
        this.commandsID = this.channelID + "commands";

        this.token = globalStore.rtmToken || (await generateRTMToken());

        /** login may fail in dev due to live reload */
        await polly()
            .waitAndRetry(3)
            .executeForPromise(() => this.client.login({ uid: userUUID, token: this.token }));

        this.channel = this.client.createChannel(channelID);
        await this.channel.join();
        this.channel.on("ChannelMessage", (msg, senderId) => {
            if (msg.messageType === AgoraRTM.MessageType.TEXT) {
                this.emit(RTMessageType.ChannelMessage, msg.text, senderId);
                if (NODE_ENV === "development") {
                    console.log(`[RTM] Received message from ${senderId}: `, msg.text);
                }
            }
        });

        if (this.commandsID) {
            this.commands = this.client.createChannel(this.commandsID);
            await this.commands.join();
            this.commands.on("ChannelMessage", (msg, senderId) => {
                if (msg.messageType === AgoraRTM.MessageType.TEXT) {
                    try {
                        const { t, v } = JSON.parse(msg.text);
                        if (t) {
                            this.emit(t, v, senderId);
                            if (NODE_ENV === "development") {
                                console.log(`[RTM] Received command from ${senderId}: `, t, v);
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        }

        return this.channel;
    }

    public async destroy(): Promise<void> {
        const { channel, commands } = this;

        this.channelID = null;
        this.commandsID = null;
        this.channel = void 0;
        this.commands = void 0;

        const promises: Array<Promise<any>> = [];

        if (channel) {
            promises.push(channel.leave());
            channel.removeAllListeners();
        }

        if (commands) {
            promises.push(commands.leave());
            commands.removeAllListeners();
        }

        this.client.removeAllListeners();
        promises.push(this.client.logout());

        try {
            await Promise.all(promises);
        } catch (e) {
            // ignore errors on logout
            if (NODE_ENV === "development") {
                console.warn(e);
            }
        }
    }

    public async sendMessage(text: string): Promise<void>;
    public async sendMessage(text: string, peerId: string): Promise<{ hasPeerReceived: boolean }>;
    public async sendMessage(
        text: string,
        peerId?: string,
    ): Promise<{ hasPeerReceived: boolean } | void> {
        if (peerId !== undefined) {
            const result = await this.client.sendMessageToPeer(
                {
                    messageType: AgoraRTM.MessageType.TEXT,
                    text,
                },
                peerId,
                { enableHistoricalMessaging: true },
            );
            if (NODE_ENV === "development") {
                console.log(`[RTM] send p2p message to ${peerId}: `, text);
            }
            return result;
        } else if (this.channel) {
            await this.channel.sendMessage(
                {
                    messageType: AgoraRTM.MessageType.TEXT,
                    text,
                },
                { enableHistoricalMessaging: true },
            );
            if (NODE_ENV === "development") {
                console.log("[RTM] send group message: ", text);
            }
        }
    }

    public async sendCommand<U extends keyof RTMEvents>(command: {
        type: U;
        value: RTMEvents[U];
        keepHistory: boolean;
    }): Promise<void>;
    public async sendCommand<U extends keyof RTMEvents>(command: {
        type: U;
        value: RTMEvents[U];
        keepHistory: boolean;
        peerId: string;
        retry?: number;
    }): Promise<void>;
    public async sendCommand<U extends keyof RTMEvents>({
        type,
        value,
        keepHistory = false,
        peerId,
        retry = 0,
    }: {
        type: U;
        value: RTMEvents[U];
        keepHistory?: boolean;
        peerId?: string;
        retry?: number;
    }): Promise<void> {
        if (!this.commands || !this.commandsID) {
            if (NODE_ENV === "development") {
                console.warn("RTM command channel closed", type, JSON.stringify(value, null, " "));
            }
            return;
        }

        if (peerId !== undefined) {
            await polly()
                .waitAndRetry(retry)
                .executeForPromise(async (): Promise<void> => {
                    const { hasPeerReceived } = await this.client.sendMessageToPeer(
                        {
                            messageType: AgoraRTM.MessageType.TEXT,
                            text: JSON.stringify({ r: this.commandsID, t: type, v: value }),
                        },
                        peerId,
                        { enableHistoricalMessaging: keepHistory },
                    );
                    if (NODE_ENV === "development") {
                        console.log(`[RTM] send p2p command to ${peerId}: `, type, value);
                    }
                    if (!hasPeerReceived) {
                        return Promise.reject("peer not received");
                    }
                });
        } else {
            await this.commands.sendMessage(
                {
                    messageType: AgoraRTM.MessageType.TEXT,
                    text: JSON.stringify({ t: type, v: value }),
                },
                { enableHistoricalMessaging: keepHistory },
            );
            if (NODE_ENV === "development") {
                console.log("[RTM] send group command: ", type, value);
            }
        }
    }

    public async fetchTextHistory(startTime: number, endTime: number): Promise<RTMessage[]> {
        return (await this.fetchHistory(this.channelID, startTime, endTime)).map(message => ({
            type: RTMessageType.ChannelMessage,
            value: message.payload,
            uuid: uuidv4(),
            timestamp: message.ms,
            userUUID: message.src,
        }));
    }

    public async fetchCommandHistory(startTime: number, endTime: number): Promise<RTMessage[]> {
        return (await this.fetchHistory(this.channelID, startTime, endTime))
            .map((message): RTMessage | null => {
                try {
                    const { t, v } = JSON.parse(message.payload);
                    if (t) {
                        return {
                            type: t,
                            value: v,
                            uuid: uuidv4(),
                            timestamp: message.ms,
                            userUUID: message.src,
                        };
                    }
                } catch (e) {
                    console.error(e);
                }
                return null;
            })
            .filter((v): v is RTMessage => v !== null);
    }

    public async fetchHistory(
        channel: string | null,
        startTime: number,
        endTime: number,
    ): Promise<RtmRESTfulQueryResourceResponse["messages"]> {
        if (!channel) {
            throw new Error("RTM is not initiated. Call `rtm.init` first.");
        }
        const { location } = await this.request<RtmRESTfulQueryPayload, RtmRESTfulQueryResponse>(
            "query",
            {
                filter: {
                    destination: channel,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                },
                offset: 0,
                limit: 100,
                order: "desc",
            },
        );
        const handle = location.replace(/^.*\/query\//, "");
        const result = await polly()
            .waitAndRetry([500, 800, 800])
            .executeForPromise(() => {
                return this.request<null, RtmRESTfulQueryResourceResponse>(
                    `query/${handle}`,
                    null,
                    { method: "GET" },
                ).then(response => (response.code === "ok" ? response : Promise.reject(response)));
            });
        return result.messages.reverse();
    }

    private async request<P = any, R = any>(
        action: string,
        payload?: P,
        config: any = {},
    ): Promise<R> {
        if (!this.token) {
            this.token = await generateRTMToken();
        }

        const response = await fetch(
            `https://api.agora.io/dev/v2/project/${AGORA.APP_ID}/rtm/message/history/${action}`,
            {
                method: "POST",
                headers: {
                    "x-agora-token": this.token,
                    "x-agora-uid": globalStore.userUUID,
                    "Content-Type": "application/json",
                    ...(config.headers || {}),
                },
                body: payload === null || payload === undefined ? void 0 : JSON.stringify(payload),
                ...config,
            },
        );
        if (!response.ok) {
            throw response;
        }
        return response.json();
    }
}

export default Rtm;
