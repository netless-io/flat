import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import polly from "polly-js";
import { v4 as uuidv4 } from "uuid";
import { AGORA, NODE_ENV } from "../constants/Process";
import { EventEmitter } from "events";

/**
 * @see {@link https://docs.agora.io/cn/Real-time-Messaging/rtm_get_event?platform=RESTful#a-namecreate_history_resa创建历史消息查询资源-api（post）}
 */
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

export enum RTMessageType {
    ChannelMessage = "ChannelMessage",
    RaiseHand = "RaiseHand",
    CancelAllHandRaising = "CancelHandRaising",
    Ban = "Ban",
    Speak = "Speak",
    Notice = "Notice",
}

export interface RTMessage<U extends keyof RtmEvents = keyof RtmEvents> {
    type: U;
    value: RtmEvents[U];
    uuid: string;
    timestamp: number;
    userId: string;
}

export interface RtmEvents {
    /** group message */
    [RTMessageType.ChannelMessage]: string;
    /** A joiner raises hand */
    [RTMessageType.RaiseHand]: boolean;
    /** creator cancel all hand raising */
    [RTMessageType.CancelAllHandRaising]: boolean;
    /** creator ban all rtm */
    [RTMessageType.Ban]: boolean;
    /** creator allow joiners to speak */
    [RTMessageType.Speak]: Array<{ uid: string; camera: boolean; mic: boolean }>;
    /** a notice message */
    [RTMessageType.Notice]: string;
}

export declare interface Rtm {
    on<U extends keyof RtmEvents>(
        event: U,
        listener: (value: RtmEvents[U], senderId: string) => void,
    ): this;
}

// eslint-disable-next-line no-redeclare
export class Rtm extends EventEmitter {
    static MessageType = AgoraRTM.MessageType;

    client: RtmClient;
    channel?: RtmChannel;
    /** Channel for commands */
    commands?: RtmChannel;

    private channelId: string | null = null;
    private commandsId: string | null = null;

    constructor() {
        super();

        if (!AGORA.APP_ID) {
            throw new Error("Agora App Id not set.");
        }
        // @TODO 实现鉴权 token
        this.client = AgoraRTM.createInstance(AGORA.APP_ID);
        this.client.on("ConnectionStateChanged", (newState, reason) => {
            console.log("RTM client state: ", newState, reason);
        });
    }

    async init(userId: string, channelId: string): Promise<RtmChannel> {
        if (this.channel) {
            if (this.channelId === channelId) {
                return this.channel;
            } else {
                await this.destroy();
            }
        }

        this.channelId = channelId;
        this.commandsId = this.channelId + "commands";

        await this.client.login({ uid: userId });

        this.channel = this.client.createChannel(channelId);
        await this.channel.join();
        this.channel.on("ChannelMessage", (msg, senderId) => {
            if (msg.messageType === AgoraRTM.MessageType.TEXT) {
                this.emit(RTMessageType.ChannelMessage, msg.text, senderId);
            }
        });

        if (this.commandsId) {
            this.commands = this.client.createChannel(this.commandsId);
            await this.commands.join();
            this.commands.on("ChannelMessage", (msg, senderId) => {
                if (msg.messageType === AgoraRTM.MessageType.TEXT) {
                    try {
                        const { t, v } = JSON.parse(msg.text);
                        if (t) {
                            this.emit(t, v, senderId);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        }

        return this.channel;
    }

    async destroy() {
        if (this.channel) {
            await this.channel.leave();
            this.channel.removeAllListeners();
        }
        if (this.commands) {
            await this.commands.leave();
            this.commands.removeAllListeners();
        }
        this.client.removeAllListeners();
        try {
            await this.client.logout();
        } catch (e) {
            // ignore errors on logout
            if (NODE_ENV === "development") {
                console.warn(e);
            }
        }
        this.channelId = null;
        this.commandsId = null;
    }

    async sendMessage(text: string): Promise<void>;
    async sendMessage(text: string, peerId: string): Promise<{ hasPeerReceived: boolean }>;
    async sendMessage(text: string, peerId?: string): Promise<{ hasPeerReceived: boolean } | void> {
        if (peerId !== undefined) {
            return this.client.sendMessageToPeer(
                {
                    messageType: AgoraRTM.MessageType.TEXT,
                    text,
                },
                peerId,
                { enableHistoricalMessaging: true },
            );
        } else if (this.channel) {
            return this.channel.sendMessage(
                {
                    messageType: AgoraRTM.MessageType.TEXT,
                    text,
                },
                { enableHistoricalMessaging: true },
            );
        }
    }

    async sendCommand<U extends keyof RtmEvents>(
        type: U,
        value: RtmEvents[U],
        enableHistoricalMessaging?: boolean,
    ): Promise<void> {
        if (!this.commands) {
            return;
        }
        return this.commands.sendMessage(
            {
                messageType: AgoraRTM.MessageType.TEXT,
                text: JSON.stringify({ t: type, v: value }),
            },
            { enableHistoricalMessaging },
        );
    }

    async fetchTextHistory(startTime: number, endTime: number): Promise<RTMessage[]> {
        return (await this.fetchHistory(this.channelId, startTime, endTime)).map(message => ({
            type: RTMessageType.ChannelMessage,
            value: message.payload,
            uuid: uuidv4(),
            timestamp: message.ms,
            userId: message.src,
        }));
    }

    async fetchCommandHistory(startTime: number, endTime: number): Promise<RTMessage[]> {
        return (await this.fetchHistory(this.channelId, startTime, endTime))
            .map((message): RTMessage | null => {
                try {
                    const { t, v } = JSON.parse(message.payload);
                    if (t) {
                        return {
                            type: t,
                            value: v,
                            uuid: uuidv4(),
                            timestamp: message.ms,
                            userId: message.src,
                        };
                    }
                } catch (e) {
                    console.error(e);
                }
                return null;
            })
            .filter((v): v is RTMessage => v !== null);
    }

    async fetchHistory(
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
        const response = await fetch(
            `https://api.agora.io/dev/v2/project/${AGORA.APP_ID}/rtm/message/history/${action}`,
            {
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa(`${AGORA.RESTFUL_ID}:${AGORA.RESTFUL_SECRET}`),
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
