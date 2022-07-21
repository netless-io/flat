import { Remitter } from "remitter";
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

export abstract class FlatRTM<
    TJoinRoomConfig extends FlatRTMJoinRoomConfig = FlatRTMJoinRoomConfig,
> {
    public abstract readonly members: Set<string>;

    public readonly events: FlatRTMEvents = new Remitter();

    public async destroy(): Promise<void> {
        this.events.destroy();
    }

    public abstract joinRoom(config: TJoinRoomConfig): Promise<void>;
    public abstract leaveRoom(): Promise<void>;

    /** Send text message to all room members */
    public abstract sendRoomMessage(message: string): Promise<void>;

    /** Send command message to all room members */
    public abstract sendRoomCommand<TName extends FlatRTMRoomCommandNames>(
        t: TName,
        v: FlatRTMRoomCommandData[TName],
    ): Promise<void>;

    /** Send text message to peer */
    public abstract sendPeerMessage(message: string, peerID: string): Promise<boolean>;

    /** Send command message to peer */
    public abstract sendPeerCommand<TName extends FlatRTMPeerCommandNames>(
        t: TName,
        v: FlatRTMPeerCommandData[TName],
        peerID: string,
    ): Promise<boolean>;
}
