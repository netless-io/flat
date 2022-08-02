import { IServiceVideoChatMode } from "@netless/flat-services";

export interface IServiceVideoChatRecordingConfig {
    roomUUID: string;
    avatarWidth: number;
    avatarHeight: number;
    mode: IServiceVideoChatMode;
}

export interface IServiceVideoChatRecording {
    startRecording(): Promise<void>;
    stopRecording(): Promise<void>;
}
