import {
    cloudRecordAcquire,
    cloudRecordQuery,
    cloudRecordStart,
    cloudRecordStop,
    cloudRecordUpdateLayout,
    updateRecordEndTime,
} from "@netless/flat-server-api";
import { IServiceRecording, IServiceRecordingJoinRoomConfig } from "@netless/flat-services";
import { Val } from "value-enhancer";
import polly from "polly-js";

import { getClientRequest, getRecordingConfig } from "./constants";

export type AgoraCloudRecordingRoomInfo = IServiceRecordingJoinRoomConfig;

// Caveats: This service saves current recording state in localStorage "recordingStates",
// which means when you enter your browser's private mode or switch to another browser,
// the recording state will be lost and you cannot start recording for a while.
//
// TODO: We should save the recording state at the server side.
export class AgoraCloudRecording extends IServiceRecording {
    private static readonly ReportingEndTimeKey = "reportingEndTime";
    private static readonly LoopQueryKey = "loopQuery";

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
        await this.queryRecordingStatus(true);
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

        const mode: AgoraCloudRecordingMode = "mix";
        const { roomID, classroomType } = this.roomInfo;
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
                                recordingConfig: getRecordingConfig(classroomType),
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
            console.warn("should call joinRoom() before stopRecording()");
            return;
        }

        await this.queryRecordingStatus();

        if (this.recordingState === null) {
            return;
        }

        const { roomID } = this.roomInfo;
        const { resourceId, sid, mode } = this.recordingState;

        this.sideEffect.flush(AgoraCloudRecording.LoopQueryKey);
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

    public async updateLayout(users: Array<{ uid: string; avatar: string }>): Promise<void> {
        if (this.roomInfo === null || this.recordingState === null) {
            throw new Error("should call joinRoom() and startRecording() before updateLayout()");
        }

        const { roomID, classroomType } = this.roomInfo;

        const clientRequest = getClientRequest(classroomType, users);

        await cloudRecordUpdateLayout({
            roomUUID: roomID,
            agoraParams: {
                resourceid: this.recordingState.resourceId,
                mode: this.recordingState.mode,
                sid: this.recordingState.sid,
            },
            agoraData: { clientRequest },
        });
    }

    public async checkIsRecording(): Promise<void> {
        await this.queryRecordingStatus();
    }

    private async queryRecordingStatus(joinRoom = false): Promise<void> {
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
            if (joinRoom && isRecording) {
                this.startReportingEndTime();
            }
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
        // Loop query status in each 2 minutes.
        // https://doc.shengwang.cn/doc/cloud-recording/restful/best-practices/integration#%E5%91%A8%E6%9C%9F%E6%80%A7%E9%A2%91%E9%81%93%E6%9F%A5%E8%AF%A2
        this.sideEffect.setInterval(
            () => {
                if (this.isRecording) {
                    this.queryRecordingStatus();
                } else {
                    this.sideEffect.flush(AgoraCloudRecording.LoopQueryKey);
                }
            },
            120 * 1000,
            AgoraCloudRecording.LoopQueryKey,
        );
    }
}

/**
 * @see {@link https://docs.agora.io/en/cloud-recording/reference/rest-api/rest}
 * @see {@link https://doc.shengwang.cn/doc/cloud-recording/restful/landing-page}
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
