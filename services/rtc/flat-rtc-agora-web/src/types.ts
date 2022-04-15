import type { FlatRTCJoinRoomConfigBase } from "@netless/flat-rtc";
import type { FlatRTCAgoraWebMode, FlatRTCAgoraWebRole } from "./constants";

export type FlatRTCAgoraWebModeType = `${FlatRTCAgoraWebMode}`;

export type FlatRTCAgoraWebRoleType = `${FlatRTCAgoraWebRole}`;

export type FlatRTCAgoraWebGetToken = (roomUUID: string) => Promise<string>;

export type FlatRTCAgoraWebUIDType = number;

export interface FlatRTCAgoraWebJoinRoomConfig
    extends FlatRTCJoinRoomConfigBase<FlatRTCAgoraWebUIDType> {
    token?: string | null;
    mode: `${FlatRTCAgoraWebModeType}`;
    role?: `${FlatRTCAgoraWebRole}`;
    refreshToken: FlatRTCAgoraWebGetToken;
    /** Skip subscribing local uids */
    isLocalUID?: (uid: FlatRTCAgoraWebUIDType) => boolean;
}
