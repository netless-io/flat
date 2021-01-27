import { makeAutoObservable, toJS, reaction } from "mobx";

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
        const config = getLSGlobalStore();
        if (config) {
            const keys = (Object.keys(config) as unknown) as Array<keyof GlobalStore>;
            for (const key of keys) {
                if (typeof this[key] !== "function") {
                    // @ts-ignore update config to store
                    this[key] = config[key];
                }
            }
        }

        makeAutoObservable(this);
        reaction(
            () => toJS(this),
            store => setLSGlobalStore(store),
        );
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

function getLSGlobalStore(): null | GlobalStore {
    try {
        const str = localStorage.getItem("GlobalStore");
        return str ? JSON.parse(str) : null;
    } catch (e) {
        return null;
    }
}

function setLSGlobalStore(globalStore: GlobalStore): void {
    localStorage.setItem("GlobalStore", JSON.stringify(globalStore));
}
