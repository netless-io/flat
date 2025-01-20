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
