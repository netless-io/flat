import type {
    IServiceVideoChatRecording,
    IServiceVideoChatRecordingConfig,
} from "@netless/flat-video-chat-recording";

export class FlatRTCRecordingAgora implements IServiceVideoChatRecording {
    public constructor(config: IServiceVideoChatRecordingConfig) {
        console.log(config);
    }

    public async startRecording(): Promise<void> {
        return;
    }
    public async stopRecording(): Promise<void> {
        return;
    }
}
