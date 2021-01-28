import { autoPersistStore } from "./utils";

export interface WechatInfo {
    avatar: string;
    name: string;
    token: string;
}

/**
 * Properties in Global Store are persisted and shared globally.
 */
export class GlobalStore {
    wechat: WechatInfo | null = null;
    userUUID: string | null = null;
    whiteboardRoomUUID: string | null = null;
    whiteboardRoomToken: string | null = null;
    rtcToken: string | null = null;
    rtmToken: string | null = null;

    constructor() {
        autoPersistStore("GlobalStore", this);
    }

    updateUserUUID = (userUUID: string): void => {
        this.userUUID = userUUID;
    };

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
