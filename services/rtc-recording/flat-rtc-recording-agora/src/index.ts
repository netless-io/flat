import type { FlatRTCRecording, FlatRTCRecordingConfig } from "@netless/flat-rtc-recording";

export class FlatRTCRecordingAgora implements FlatRTCRecording {
    public constructor(config: FlatRTCRecordingConfig) {
        console.log(config);
    }

    public async startRecording(): Promise<void> {
        return;
    }
    public async stopRecording(): Promise<void> {
        return;
    }
}
