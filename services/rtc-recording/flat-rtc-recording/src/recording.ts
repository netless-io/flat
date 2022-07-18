import { FlatRTCMode } from "@netless/flat-rtc";

export interface FlatRTCRecordingConfig {
    roomUUID: string;
    avatarWidth: number;
    avatarHeight: number;
    mode: FlatRTCMode;
}

export interface FlatRTCRecording {
    startRecording(): Promise<void>;
    stopRecording(): Promise<void>;
}
