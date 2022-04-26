export interface FlatRTMRoomCommandData {
    ban: { roomUUID: string; status: boolean };
    notice: { roomUUID: string; text: string };
}

export type FlatRTMRoomCommandNames = keyof FlatRTMRoomCommandData;

export type FlatRTMRoomCommand<TName extends FlatRTMRoomCommandNames = FlatRTMRoomCommandNames> =
    TName extends FlatRTMRoomCommandNames ? { t: TName; v: FlatRTMRoomCommandData[TName] } : never;

export interface FlatRTMPeerCommandData {
    /** From student to teacher */
    "raise-hand": { roomUUID: string; raiseHand: boolean };
    /** From teacher to student */
    "on-stage": { roomUUID: string; onStage: boolean };
}

export type FlatRTMPeerCommandNames = keyof FlatRTMPeerCommandData;

export type FlatRTMPeerCommand<TName extends FlatRTMPeerCommandNames = FlatRTMPeerCommandNames> =
    TName extends FlatRTMPeerCommandNames
        ? { t: TName; v: FlatRTMPeerCommandData[TName] & { roomUUID: string } }
        : never;
