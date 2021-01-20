import { makeAutoObservable, toJS, reaction } from "mobx";
import { mergeConfig } from "./utils";

export interface WechatInfo {
    avatar: string;
    name: string;
    token: string;
}

/**
 * Properties in Global Store are persisted and shared globally.
 */
class GlobalStore {
    wechat: WechatInfo | null = null;
    userUUID: string | null = null;
    whiteboardUUID: string | null = null;
    whiteboardToken: string | null = null;
    rtcToken: string | null = null;
    rtmToken: string | null = null;

    constructor() {
        mergeConfig(this, getLSGlobalStore());
        makeAutoObservable(this);
        reaction(
            () => toJS(this),
            store => setLSGlobalStore(store),
        );
    }

    updateUserUUID(userUUID: string) {
        this.userUUID = userUUID;
    }

    updateWechat(wechatInfo: WechatInfo) {
        this.wechat = wechatInfo;
    }

    updateToken(
        config: Pick<GlobalStore, "whiteboardUUID" | "whiteboardToken" | "rtcToken" | "rtmToken">,
    ) {
        mergeConfig(this, config);
    }
}

export const globalStore = new GlobalStore();

function getLSGlobalStore() {
    try {
        const str = localStorage.getItem("GlobalStore");
        return str ? JSON.parse(str) : null;
    } catch (e) {
        return null;
    }
}

function setLSGlobalStore(globalStore: GlobalStore) {
    localStorage.setItem("GlobalStore", JSON.stringify(globalStore));
}
