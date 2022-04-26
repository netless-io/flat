import type {
    FlatRTMPeerCommandData,
    FlatRTMPeerCommandNames,
    FlatRTMRoomCommandData,
    FlatRTMRoomCommandNames,
} from "./commands";
import type { FlatRTMEvents } from "./events";

export interface FlatRTMJoinRoomConfig {
    roomUUID: string;
    ownerUUID: string;
    uid: string;
    token?: string | null;
    refreshToken?: (roomUUID: string) => Promise<string>;
}

export interface FlatRTM<TJoinRoomConfig extends FlatRTMJoinRoomConfig = FlatRTMJoinRoomConfig> {
    readonly members: Set<string>;

    readonly events: FlatRTMEvents;

    destroy(): Promise<void>;

    joinRoom(config: TJoinRoomConfig): Promise<void>;
    leaveRoom(): Promise<void>;

    /** Send text message to all room members */
    sendRoomMessage(message: string): Promise<void>;

    /** Send command message to all room members */
    sendRoomCommand<TName extends FlatRTMRoomCommandNames>(
        t: TName,
        v: FlatRTMRoomCommandData[TName],
    ): Promise<void>;

    /** Send text message to peer */
    sendPeerMessage(message: string, peerID: string): Promise<boolean>;

    /** Send command message to peer */
    sendPeerCommand<TName extends FlatRTMPeerCommandNames>(
        t: TName,
        v: FlatRTMPeerCommandData[TName],
        peerID: string,
    ): Promise<boolean>;
}
