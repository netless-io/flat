export interface User {
    userUUID: string;
    name: string;
    /** is on stage */
    isSpeak: boolean;
    /** can operate whiteboard */
    wbOperate: boolean;
    isRaiseHand: boolean;
    avatar: string;
    hasLeft?: boolean;
}
