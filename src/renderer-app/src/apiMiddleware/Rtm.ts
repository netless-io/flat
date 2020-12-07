import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import polly from "polly-js";
import { v4 as uuidv4 } from "uuid";

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

export interface RTMessage {
    uuid: string;
    timestamp: number;
    text: string;
    userId: string;
}

export class Rtm {
    static MessageType = AgoraRTM.MessageType;

    client: RtmClient;
    channel?: RtmChannel;

    private appId: string = process.env.AGORA_APP_ID || "";
    private restfulId: string = process.env.AGORA_RESTFUL_ID || "";
    private restfulSecret: string = process.env.AGORA_RESTFUL_SECRET || "";

    private channelId: string | null = null;

    constructor() {
        if (!this.appId) {
            throw new Error("Agora App Id not set.");
        }
        // @TODO 实现鉴权 token
        this.client = AgoraRTM.createInstance(this.appId);
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
            // ingore errors on logout
            if (process.env.NODE_ENV === "development") {
                console.warn(e);
            }
        }
        this.channelId = null;
    }

    async fetchHistory(oldestTimestap: number = Date.now()): Promise<RTMessage[]> {
        if (!this.channelId) {
            throw new Error("RTM is not initiated. Call `rtm.init` first.");
        }
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        const { location } = await this.request<RtmRESTfulQueryPayload, RtmRESTfulQueryResponse>(
            "query",
            {
                filter: {
                    destination: this.channelId,
                    start_time: new Date(oldestTimestap - oneYear).toISOString(),
                    end_time: new Date(oldestTimestap - 1).toISOString(),
                },
                offset: 0,
                limit: 50,
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
            .map(message => ({
                uuid: uuidv4(),
                timestamp: message.ms,
                text: message.payload,
                userId: message.src,
            }))
            .reverse();
    }

    private async request<P = any, R = any>(
        action: string,
        payload?: P,
        config: any = {},
    ): Promise<R> {
        const response = await fetch(
            `https://api.agora.io/dev/v2/project/${this.appId}/rtm/message/history/${action}`,
            {
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa(`${this.restfulId}:${this.restfulSecret}`),
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
