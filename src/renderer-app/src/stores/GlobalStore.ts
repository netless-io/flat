import { autoPersistStore } from "./utils";

// clear storage if not match
const LS_VERSION = 1;

export interface WechatInfo {
    userUUID: string;
    avatar: string;
    name: string;
    token: string;
}

/**
 * Properties in Global Store are persisted and shared globally.
 */
export class GlobalStore {
    wechat: WechatInfo | null = null;
    whiteboardRoomUUID: string | null = null;
    whiteboardRoomToken: string | null = null;
    rtcToken: string | null = null;
    rtcUID: number | null = null;
    rtmToken: string | null = null;

    get userUUID(): string | undefined {
        return this.wechat?.userUUID;
    }

    get userName(): string | undefined {
        return this.wechat?.name;
    }

    constructor() {
        autoPersistStore({ storeLSName: "GlobalStore", store: this, version: LS_VERSION });
    }

    updateWechat = (wechatInfo: WechatInfo): void => {
        this.wechat = wechatInfo;
    };

    updateToken = (
        config: Partial<
            Pick<
                GlobalStore,
                "whiteboardRoomUUID" | "whiteboardRoomToken" | "rtcToken" | "rtmToken" | "rtcUID"
            >
        >,
    ): void => {
        const keys = [
            "whiteboardRoomUUID",
            "whiteboardRoomToken",
            "rtcToken",
            "rtmToken",
            "rtcUID",
        ] as const;
        for (const key of keys) {
            const value = config[key];
            if (value !== null && value !== undefined) {
                this[key] = value as any;
            }
        }
    };
}

export const globalStore = new GlobalStore();
