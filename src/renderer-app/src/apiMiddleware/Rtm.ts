import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import polly from "polly-js";
import { v4 as uuidv4 } from "uuid";
import { AGORA, NODE_ENV } from "../constants/Process";

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
    // Order MUST be fixed.
    // New items MUST be added at the end of the list.
    Text,
    RaiseHand,
    CancelHandRaising,
    Ban,
    Speak,
    Notice,
}

export interface RTMessageBase {
    uuid: string;
    timestamp: number;
    userId: string;
}

export interface RTMessageText extends RTMessageBase {
    type: RTMessageType.Text;
    value: string;
}

/** Student raises hand */
export interface RTMessageRaiseHand extends RTMessageBase {
    type: RTMessageType.RaiseHand;
    value: boolean;
}

/** Teacher allows hand raising  */
export interface RTMessageCancelHandRaising extends RTMessageBase {
    type: RTMessageType.CancelHandRaising;
    value?: true;
}

/** Ban students for sending messages */
export interface RTMessageBan extends RTMessageBase {
    type: RTMessageType.Ban;
    value: boolean;
}

/** Teacher allows a student to speak */
export interface RTMessageSpeak extends RTMessageBase {
    type: RTMessageType.Speak;
    value: {
        uid: string;
        speak: boolean;
    };
}

export interface RTMessageNotice extends RTMessageBase {
    type: RTMessageType.Notice;
    value: string;
}

export type RTMessage =
    | RTMessageText
    | RTMessageRaiseHand
    | RTMessageCancelHandRaising
    | RTMessageBan
    | RTMessageSpeak
    | RTMessageNotice;

export interface RTMRawMessageText {
    t: RTMessageType.Text;
    v: string;
}

export interface RTMRawMessageRaiseHand {
    t: RTMessageType.RaiseHand;
    v: boolean;
}

export interface RTMRawMessageCancelHandRaising {
    t: RTMessageType.CancelHandRaising;
    v?: true;
}

export interface RTMRawMessageBan {
    t: RTMessageType.Ban;
    v: boolean;
}

export interface RTMRawMessageSpeak {
    t: RTMessageType.Speak;
    v: {
        uid: string;
        speak: boolean;
    };
}

export interface RTMRawMessageNotice {
    t: RTMessageType.Notice;
    v: string;
}

export type RTMRawMessage =
    | RTMRawMessageText
    | RTMRawMessageRaiseHand
    | RTMRawMessageCancelHandRaising
    | RTMRawMessageBan
    | RTMRawMessageSpeak
    | RTMRawMessageNotice;

export class Rtm {
    static MessageType = AgoraRTM.MessageType;

    client: RtmClient;
    channel?: RtmChannel;

    private channelId: string | null = null;

    constructor() {
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
        this.channelId = channelId;
        await this.client.login({ uid: userId });
        this.channel = this.client.createChannel(channelId);
        await this.channel.join();
        return this.channel;
    }

    async destroy() {
        if (this.channel) {
            this.channel.leave();
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
    }

    async sendMessage(message: RTMRawMessage): Promise<void>;
    async sendMessage(
        message: RTMRawMessage,
        peerId: string,
    ): Promise<{ hasPeerReceived: boolean }>;
    async sendMessage(
        message: RTMRawMessage,
        peerId?: string,
    ): Promise<{ hasPeerReceived: boolean } | void> {
        const text = JSON.stringify(message);
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

    async fetchHistory(startTime: number, endTime: number): Promise<RTMessage[]> {
        if (!this.channelId) {
            throw new Error("RTM is not initiated. Call `rtm.init` first.");
        }
        const { location } = await this.request<RtmRESTfulQueryPayload, RtmRESTfulQueryResponse>(
            "query",
            {
                filter: {
                    destination: this.channelId,
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
        return result.messages
            .map(message => {
                let type = RTMessageType.Text;
                let value: any = message.payload;

                try {
                    const m = JSON.parse(message.payload);
                    if (m.t !== undefined) {
                        type = m.t;
                        value = m.v;
                    }
                } catch (e) {
                    // ignore legacy type
                }

                return {
                    type,
                    value,
                    uuid: uuidv4(),
                    timestamp: message.ms,
                    userId: message.src,
                };
            })
            .reverse();
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
