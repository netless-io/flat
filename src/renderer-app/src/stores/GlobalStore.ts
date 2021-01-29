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
    rtmToken: string | null = null;

    get userUUID(): string | null {
        return this.wechat && this.wechat.userUUID;
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
                "whiteboardRoomUUID" | "whiteboardRoomToken" | "rtcToken" | "rtmToken"
            >
        >,
    ): void => {
        const keys = ["whiteboardRoomUUID", "whiteboardRoomToken", "rtcToken", "rtmToken"] as const;
        for (const key of keys) {
            const value = config[key];
            if (value) {
                this[key] = value;
            }
        }
    };
}

export const globalStore = new GlobalStore();
