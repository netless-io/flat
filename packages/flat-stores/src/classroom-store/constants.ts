export enum ClassModeType {
    Lecture = "Lecture",
    Interaction = "Interaction",
}

export enum RoomStatusLoadingType {
    Null,
    Starting,
    Pausing,
    Stopping,
}

export const TIMEOUT_MS = 5000; // Timeout for incomplete messages

// 历史原因,之前aiBotID是1234(在rtc服务端配置的),现在改成了前端配置.为了保持兼容性,这里保留了1234
export const AI_Chat_Bot_ID = 1234;
