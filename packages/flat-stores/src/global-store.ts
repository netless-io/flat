import { Region } from "flat-components";
import {
    LoginProcessResult,
    setFlatAuthToken,
    ServerRegionConfigResult,
} from "@netless/flat-server-api";
import { autorun } from "mobx";
import { autoPersistStore } from "./utils/auto-persist-store";

// clear storage if not match
const LS_VERSION = 1;

export type UserInfo = LoginProcessResult;
export type ServerRegionConfig = ServerRegionConfigResult;

export type Account = {
    key: string;
    password: string;
};

/**
 * Properties in Global Store are persisted and shared globally.
 */
export class GlobalStore {
    public serverRegionConfig: ServerRegionConfig | null = null;
    /**
     * Show tooltips for classroom record hints.
     * Hide it permanently if user close the tooltip.
     */
    public isShowRecordHintTips = true;
    public isShowGuide = false;
    public isTurnOffDeviceTest = false;
    public userInfo: UserInfo | null = null;

    // login with password
    public currentAccount: Account | null = null;
    public accountHistory: Account[] | [] = [];

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
    /**
     * As a joiner, he/she/they can go on stage in small class mode for *the first time*.
     * This array holds the rooms that this behavior has been done.
     */
    public onStageRoomUUIDs: string[] | undefined = undefined;
    /**
     * Users can hide avatars (top row) in small class mode.
     * This array holds the rooms that its avatars have been hidden.
     */
    public hideAvatarsRoomUUIDs: string[] | undefined = undefined;

    public get userUUID(): string | undefined {
        return this.userInfo?.userUUID;
    }

    public get userName(): string | undefined {
        return this.userInfo?.name;
    }

    public get hasPassword(): boolean {
        return this.userInfo?.hasPassword ?? false;
    }

    public get needPhoneBinding(): boolean {
        return this.serverRegionConfig?.login.smsForce ?? false;
    }

    public get censorshipText(): boolean {
        return this.serverRegionConfig?.censorship.text ?? false;
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

    public pushOnStageRoomUUID = (roomUUID: string): void => {
        this.onStageRoomUUIDs ||= [];
        if (!this.onStageRoomUUIDs.includes(roomUUID)) {
            this.onStageRoomUUIDs.push(roomUUID);
        }
        while (this.onStageRoomUUIDs.length > 10) {
            this.onStageRoomUUIDs.shift();
        }
    };

    public wasOnStage = (roomUUID: string): boolean => {
        return this.onStageRoomUUIDs?.includes(roomUUID) ?? false;
    };

    public isAvatarsVisible = (roomUUID: string): boolean => {
        return !this.hideAvatarsRoomUUIDs?.includes(roomUUID);
    };

    public toggleAvatars = (roomUUID: string, show: boolean): void => {
        this.hideAvatarsRoomUUIDs ||= [];
        if (show) {
            this.hideAvatarsRoomUUIDs = this.hideAvatarsRoomUUIDs.filter(uuid => uuid !== roomUUID);
        } else {
            if (!this.hideAvatarsRoomUUIDs.includes(roomUUID)) {
                this.hideAvatarsRoomUUIDs.push(roomUUID);
            }
            while (this.hideAvatarsRoomUUIDs.length > 10) {
                this.hideAvatarsRoomUUIDs.shift();
            }
        }
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
        this.currentAccount = null;
        this.lastLoginCheck = null;
        this.onStageRoomUUIDs = [];
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

    public deleteCurrentAccountFromHistory = (): void => {
        this.accountHistory = this.accountHistory.filter(
            account => account.key !== this.currentAccount?.key,
        );

        this.currentAccount = null;
    };

    public updateAccountHistory = ({ key, password }: Account): void => {
        // update current account
        this.currentAccount = { key, password };

        const hash: Record<string, boolean> = {};
        this.accountHistory = [{ key, password }, ...this.accountHistory].reduce(
            (history: Account[], next: Account) => {
                if (!hash[next.key]) {
                    hash[next.key] = true;
                    history.push(next);
                }

                return history;
            },
            [],
        );
    };

    public updateServerRegionConfig = (config: ServerRegionConfig | null): void => {
        this.serverRegionConfig = config;
    };
}

export const globalStore = new GlobalStore();

if (process.env.NODE_ENV !== "production") {
    (window as any).globalStore = globalStore;
}
