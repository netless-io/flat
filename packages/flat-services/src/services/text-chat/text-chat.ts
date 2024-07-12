import { Remitter } from "remitter";
import { SideEffectManager } from "side-effect-manager";
import { IService } from "../typing";
import {
    IServiceTextChatPeerCommandData,
    IServiceTextChatPeerCommandNames,
    IServiceTextChatRoomCommandData,
    IServiceTextChatRoomCommandNames,
} from "./commands";
import type { IServiceTextChatEvents } from "./events";

export interface IServiceTextChatJoinRoomConfig {
    roomUUID: string;
    ownerUUID: string;
    uid: string;
    token?: string | null;
}

export abstract class IServiceTextChat implements IService {
    protected readonly sideEffect = new SideEffectManager();

    public abstract readonly members: Set<string>;

    public readonly events: IServiceTextChatEvents = new Remitter();

    public async destroy(): Promise<void> {
        this.sideEffect.flushAll();
        this.events.destroy();
    }

    public abstract joinRoom(config: IServiceTextChatJoinRoomConfig): Promise<void>;
    public abstract leaveRoom(): Promise<void>;

    /** Send text message to all room members */
    public abstract sendRoomMessage(message: string): Promise<void>;

    /** Send text message to peer */
    public abstract sendPeerMessage(message: string, peerID: string): Promise<boolean>;

    // @TODO move commands to classroom service

    /** Send command message to all room members */
    public abstract sendRoomCommand<TName extends IServiceTextChatRoomCommandNames>(
        t: TName,
        v: IServiceTextChatRoomCommandData[TName],
    ): Promise<void>;

    /** Send command message to peer */
    public abstract sendPeerCommand<TName extends IServiceTextChatPeerCommandNames>(
        t: TName,
        v: IServiceTextChatPeerCommandData[TName],
        peerID: string,
    ): Promise<boolean>;
}
