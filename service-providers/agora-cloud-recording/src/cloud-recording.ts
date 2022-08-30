import {
    cloudRecordAcquire,
    cloudRecordQuery,
    cloudRecordStart,
    cloudRecordStop,
    RoomType,
    updateRecordEndTime,
} from "@netless/flat-server-api";
import { IServiceRecording, IServiceRecordingJoinRoomConfig } from "@netless/flat-services";
import { Val } from "value-enhancer";
import polly from "polly-js";

export type AgoraCloudRecordingRoomInfo = IServiceRecordingJoinRoomConfig;

export enum AgoraCloudRecordingChannelType {
    Communication = 0,
    Broadcast = 1,
}

// Caveats: This service saves current recording state in localStorage "recordingStates",
// which means when you enter your browser's private mode or switch to another browser,
// the recording state will be lost and you cannot start recording for a while.
//
// TODO: We should save the recording state at the server side.
export class AgoraCloudRecording extends IServiceRecording {
    private static readonly ReportingEndTimeKey = "reportingEndTime";

    private roomInfo: AgoraCloudRecordingRoomInfo | null;
    private recordingState: AgoraCloudRecordingState | null;

    public readonly $Val: Readonly<{
        isRecording$: Val<boolean>;
    }>;

    public get roomID(): string | null {
        return this.roomInfo?.roomID ?? null;
    }

    public get isRecording(): boolean {
        return this.$Val.isRecording$.value;
    }

    public constructor() {
        super();

        this.roomInfo = null;
        this.recordingState = null;

        this.$Val = {
            isRecording$: new Val(false),
        };
    }

    public async joinRoom(config: IServiceRecordingJoinRoomConfig): Promise<void> {
        this.roomInfo = config;
        this.recordingState = loadCloudRecordingState(config.roomID);
        await this.queryRecordingStatus();
    }

    public async leaveRoom(): Promise<void> {
        if (this.isRecording) {
            await this.stopRecording().catch(console.error);
        }
        this.roomInfo = null;
        this.recordingState = null;
        this.$Val.isRecording$.setValue(false);
    }

    public async startRecording(): Promise<void> {
        if (this.roomInfo === null) {
            throw new Error("should call joinRoom() before startRecording()");
        }

        await this.queryRecordingStatus();

        if (this.isRecording) {
            return;
        }

        const mode: AgoraCloudRecordingMode = "individual";
        const { roomID, classroomType } = this.roomInfo;
        const channelType = convertRoomType(classroomType);
        try {
            const RetryIntervals = [0, 1000, 3000, 5000, 7000];
            const recordingState = await polly()
                .waitAndRetry(5)
                .executeForPromise(async ({ count }) => {
                    if (count) {
                        await sleep(RetryIntervals[count]);
                    }
                    const { resourceId } = await cloudRecordAcquire({
                        roomUUID: roomID,
                        agoraData: {
                            clientRequest: {
                                resourceExpiredHour: 24,
                            },
                        },
                    });
                    const { sid } = await cloudRecordStart({
                        roomUUID: roomID,
                        agoraParams: {
                            resourceid: resourceId,
                            mode: mode,
                        },
                        agoraData: {
                            clientRequest: {
                                recordingConfig: {
                                    subscribeUidGroup: 2,
                                    maxIdleTime: 5 * 60,
                                    channelType: channelType,
                                },
                            },
                        },
                    });
                    return { resourceId, sid, mode };
                });

            this.recordingState = recordingState;
            saveCloudRecordingState(roomID, recordingState);
            this.$Val.isRecording$.setValue(true);
            this.startReportingEndTime();
        } catch (error) {
            this.$Val.isRecording$.setValue(false);
            throw error;
        }
    }

    public async stopRecording(): Promise<void> {
        if (this.roomInfo === null) {
            throw new Error("should call joinRoom() before stopRecording()");
        }

        await this.queryRecordingStatus();

        if (this.recordingState === null) {
            return;
        }

        const { roomID } = this.roomInfo;
        const { resourceId, sid, mode } = this.recordingState;

        this.sideEffect.flush(AgoraCloudRecording.ReportingEndTimeKey);
        this.recordingState = null;

        try {
            saveCloudRecordingState(roomID, null);
            await cloudRecordStop({
                roomUUID: roomID,
                agoraParams: {
                    resourceid: resourceId,
                    sid: sid,
                    mode: mode,
                },
            });
        } finally {
            this.$Val.isRecording$.setValue(false);
        }
    }

    private async queryRecordingStatus(): Promise<void> {
        if (this.recordingState === null || this.roomID === null) {
            this.$Val.isRecording$.setValue(false);
            return;
        }
        try {
            const { resourceId, sid, mode } = this.recordingState;
            const { serverResponse } = await cloudRecordQuery({
                roomUUID: this.roomID,
                agoraParams: {
                    resourceid: resourceId,
                    sid: sid,
                    mode: mode,
                },
            });
            const isRecording = 1 <= serverResponse.status && serverResponse.status <= 5;
            this.$Val.isRecording$.setValue(isRecording);
        } catch {
            this.recordingState = null;
            this.$Val.isRecording$.setValue(false);
            if (this.roomID) {
                saveCloudRecordingState(this.roomID, null);
            }
        }
    }

    private startReportingEndTime(): void {
        this.sideEffect.setInterval(
            () => {
                const roomID = this.roomInfo?.roomID;
                if (this.isRecording && roomID) {
                    updateRecordEndTime(roomID);
                } else {
                    this.sideEffect.flush(AgoraCloudRecording.ReportingEndTimeKey);
                }
            },
            10 * 1000,
            AgoraCloudRecording.ReportingEndTimeKey,
        );
    }
}

/**
 * We always use "individual" mode in Flat.
 *
 * @see {@link https://docs.agora.io/en/cloud-recording/cloud_recording_manage_files?platform=RESTful#individual-recording}
 */
export type AgoraCloudRecordingMode = "individual" | "mix";

export interface AgoraCloudRecordingState {
    resourceId: string;
    sid: string;
    mode: AgoraCloudRecordingMode;
}

function loadCloudRecordingState(roomID: string): AgoraCloudRecordingState | null {
    let data: Record<string, AgoraCloudRecordingState>;
    try {
        data = JSON.parse(localStorage.getItem("recordingStates") || "{}");
    } catch {
        data = {};
    }
    return data[roomID] ?? null;
}

function saveCloudRecordingState(roomID: string, state: AgoraCloudRecordingState | null): void {
    let data: Record<string, AgoraCloudRecordingState>;
    try {
        data = JSON.parse(localStorage.getItem("recordingStates") || "{}");
    } catch {
        data = {};
    }
    if (state === null) {
        delete data[roomID];
    } else {
        data[roomID] = state;
    }
    localStorage.setItem("recordingStates", JSON.stringify(data));
}

function sleep(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function convertRoomType(roomType: RoomType): AgoraCloudRecordingChannelType {
    if (roomType === RoomType.BigClass) {
        return AgoraCloudRecordingChannelType.Broadcast;
    } else {
        return AgoraCloudRecordingChannelType.Communication;
    }
}
