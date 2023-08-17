import polly from "polly-js";
import { generateRTMToken } from "@netless/flat-server-api";
import { IServiceTextChatEventData } from "@netless/flat-services";
import { globalStore } from "../global-store";
import { v4 } from "uuid";

export interface AgoraRTMQueryPayload {
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

export interface AgoraRTMQueryResponse {
    result: string;
    offset: number;
    limit: number;
    order: string;
    location: string;
}

export interface AgoraRTMQueryResourceResponse {
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

// unused because RTM has shutdown the history function
export class TextChatHistory {
    public roomUUID: string;
    public userUUID: string;

    public token?: string;

    public constructor(config: { roomUUID: string; userUUID: string }) {
        this.roomUUID = config.roomUUID;
        this.userUUID = config.userUUID;
    }

    public async fetchTextHistory(
        startTime: number,
        endTime: number,
    ): Promise<Array<IServiceTextChatEventData["room-message"]>> {
        const roomUUID = this.roomUUID;
        if (!roomUUID) {
            throw new Error("fetchTextHistory: no roomUUID");
        }
        const { location } = await this._request<AgoraRTMQueryPayload, AgoraRTMQueryResponse>(
            "query",
            {
                filter: {
                    destination: roomUUID,
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
            .executeForPromise(() =>
                this._request<null, AgoraRTMQueryResourceResponse>(`query/${handle}`, null, {
                    method: "GET",
                }),
            );

        return result.messages.reverse().map(e => ({
            roomUUID,
            uuid: v4(),
            timestamp: e.ms,
            text: e.payload,
            senderID: e.src,
        }));
    }

    private async _request<Body = any, Result = any>(
        action: string,
        payload?: Body,
        config: RequestInit = {},
    ): Promise<Result> {
        if (!this.token) {
            this.token = await generateRTMToken();
        }

        const appId = globalStore.serverRegionConfig?.agora.appId;
        if (!appId) {
            throw new Error("missing server region config");
        }

        const response = await fetch(
            `https://api.agora.io/dev/v2/project/${appId}/rtm/message/history/${action}`,
            {
                method: "POST",
                // eslint-disable-next-line eqeqeq
                body: payload == null ? void 0 : JSON.stringify(payload),
                ...config,
                headers: {
                    "x-agora-token": this.token,
                    "x-agora-uid": this.userUUID || "",
                    "Content-Type": "application/json",
                    ...config.headers,
                },
            },
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json();
    }
}
