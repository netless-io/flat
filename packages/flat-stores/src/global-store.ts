import { Region } from "flat-components";
import { LoginProcessResult, setFlatAuthToken } from "@netless/flat-server-api";
import { autorun } from "mobx";
import { autoPersistStore } from "./utils/auto-persist-store";

// clear storage if not match
const LS_VERSION = 1;

export type UserInfo = LoginProcessResult;

/**
 * Properties in Global Store are persisted and shared globally.
 */
export class GlobalStore {
    /**
     * Show tooltips for classroom record hints.
     * Hide it permanently if user close the tooltip.
     */
    public isShowRecordHintTips = true;
    public isShowGuide = false;
    public isTurnOffDeviceTest = false;
    public userInfo: UserInfo | null = null;
    public whiteboardRoomUUID: string | null = null;
    public whiteboardRoomToken: string | null = null;
    public region: Region | null = null;
    public rtcToken: string | null = null;
    public rtcUID: number | null = null;
    public rtcShareScreen: {
        uid: number;
        token: string;
    } | null = null;
    public rtmToken: string | null = null;
    public lastLoginCheck: number | null = null;
    /**
     * To sync update the roomStore's room information data after call the begin of the class in the classRoomStore,
     * that for sure roomStore's begin time value of roomInfo is correct so that the classroom page's Timer component display correctly.
     */
    public periodicUUID: string | undefined = undefined;

    public get userUUID(): string | undefined {
        return this.userInfo?.userUUID;
    }

    public get userName(): string | undefined {
        return this.userInfo?.name;
    }

    public constructor() {
        autoPersistStore({ storeLSName: "GlobalStore", store: this, version: LS_VERSION });
        autorun(() => {
            if (this.userInfo?.token) {
                setFlatAuthToken(this.userInfo.token);
            }
        });
    }

    public updateUserInfo = (userInfo: UserInfo | null): void => {
        this.userInfo = userInfo;
    };

    public updateUserAvatar = (avatarURL: string): void => {
        if (this.userInfo) {
            this.userInfo.avatar = avatarURL;
        }
    };

    public updateUserToken = (token: string): void => {
        if (this.userInfo) {
            this.userInfo.token = token;
        }
    };

    public updateLastLoginCheck = (val: number | null): void => {
        this.lastLoginCheck = val;
    };

    public updateToken = (
        config: Partial<
            Pick<
                GlobalStore,
                | "whiteboardRoomUUID"
                | "whiteboardRoomToken"
                | "rtcToken"
                | "rtmToken"
                | "rtcUID"
                | "rtcShareScreen"
                | "region"
            >
        >,
    ): void => {
        const keys = [
            "whiteboardRoomUUID",
            "whiteboardRoomToken",
            "rtcToken",
            "rtmToken",
            "rtcUID",
            "rtcShareScreen",
            "region",
        ] as const;
        for (const key of keys) {
            const value = config[key];
            if (value !== null && value !== undefined) {
                this[key] = value as any;
            }
        }
    };

    public logout = (): void => {
        this.userInfo = null;
        this.lastLoginCheck = null;
        document.cookie = "flatJWTToken=; SameSite=Lax; domain=whiteboard.agora.io; max-age=0";
    };

    public hideRecordHintTips = (): void => {
        this.isShowRecordHintTips = false;
    };

    public toggleDeviceTest = (): void => {
        this.isTurnOffDeviceTest = !this.isTurnOffDeviceTest;
    };

    public isShareScreenUID = (uid: number): boolean => {
        return this.rtcShareScreen?.uid === Number(uid);
    };

    public updateShowGuide = (showGuide: boolean): void => {
        this.isShowGuide = showGuide;
    };

    public updatePeriodicUUID = (periodicUUID?: string): void => {
        this.periodicUUID = periodicUUID;
    };
}

export const globalStore = new GlobalStore();

if (process.env.NODE_ENV !== "production") {
    (window as any).globalStore = globalStore;
}
