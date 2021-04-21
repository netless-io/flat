import { autoPersistStore } from "./utils";
import { LoginProcessResult } from "../apiMiddleware/flatServer";

// clear storage if not match
const LS_VERSION = 1;

export type WechatInfo = LoginProcessResult;

/**
 * Properties in Global Store are persisted and shared globally.
 */
export class GlobalStore {
    /**
     * Show tooltips for classroom record hints.
     * Hide it permanently if user close the tooltip.
     */
    isShowRecordHintTips = true;
    isShowAppUpgradeModal = false;
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

    hideRecordHintTips = (): void => {
        this.isShowRecordHintTips = false;
    };

    showAppUpgradeModal = (): void => {
        this.isShowAppUpgradeModal = true;
    };

    hideAppUpgradeModal = (): void => {
        this.isShowAppUpgradeModal = false;
    };
}

export const globalStore = new GlobalStore();
