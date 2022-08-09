import polly from "polly-js";
import { updateRecordEndTime } from "./flatServer";
import {
    cloudRecordAcquire,
    CloudRecordStopResult,
    cloudRecordStop,
    CloudRecordAcquirePayload,
    CloudRecordStartPayload,
    cloudRecordStart,
    CloudRecordQueryResult,
    cloudRecordQuery,
    cloudRecordUpdateLayout,
    CloudRecordUpdateLayoutPayload,
    CloudRecordUpdateLayoutResult,
} from "./flatServer/agora";

/**
 * Agora Cloud Recording
 * document see: https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest?platform=RESTful
 */
export class CloudRecording {
    public mode: "individual" | "mix" = "mix";

    /** record channel name */
    public roomUUID: string;

    public get resourceid(): string {
        if (this._resourceid === null || this._resourceid === undefined) {
            throw new Error("No resourceid. Use `couldRecording.acquire` to acquire one.");
        }
        return this._resourceid;
    }

    public get sid(): string {
        if (this._sid === null || this._sid === undefined) {
            throw new Error("No sid. Use `couldRecording.start` to acquire one.");
        }
        return this._sid;
    }

    public get isRecording(): boolean {
        return this._isRecording;
    }

    private _resourceid: string | null;
    private _sid: string | null;
    private _isRecording = false;

    private _reportEndTimeTimeout = NaN;

    public constructor(init: { roomUUID: string }) {
        this.roomUUID = init.roomUUID;
        const data = persistCloudRecordingData(this.roomUUID);
        if (data) {
            this._resourceid = data.resourceId;
            this._sid = data.sid;
        } else {
            this._resourceid = null;
            this._sid = null;
        }
    }

    public async queryRecordingStatus(): Promise<void> {
        if (this._resourceid === null) {
            this._isRecording = false;
            return;
        }
        try {
            const { serverResponse } = await this.query();
            this._isRecording = 1 <= serverResponse.status && serverResponse.status <= 5;
        } catch {
            this._isRecording = false;
            this._resourceid = null;
            this._sid = null;
        }
    }

    public async start(
        startPayload: CloudRecordStartPayload["agoraData"]["clientRequest"] = {
            recordingConfig: {
                subscribeUidGroup: 0,
                maxIdleTime: 5 * 60,
                transcodingConfig: {
                    width: 640,
                    height: 360,
                    fps: 15,
                    bitrate: 500,
                    defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
                },
            },
        },
        acquirePayload: CloudRecordAcquirePayload["agoraData"]["clientRequest"] = {
            resourceExpiredHour: 24,
        },
    ): Promise<void> {
        await this.queryRecordingStatus();

        if (this._isRecording) {
            return;
        }

        try {
            const RetryIntervals = [0, 1000, 3000, 5000, 7000];
            const { resourceId, sid } = await polly()
                .waitAndRetry(5)
                .executeForPromise(async ({ count }) => {
                    if (count) {
                        await new Promise(resolve => setTimeout(resolve, RetryIntervals[count]));
                    }
                    const { resourceId } = await cloudRecordAcquire({
                        roomUUID: this.roomUUID,
                        agoraData: { clientRequest: acquirePayload },
                    });
                    const { sid } = await cloudRecordStart({
                        roomUUID: this.roomUUID,
                        agoraParams: {
                            resourceid: resourceId,
                            mode: this.mode,
                        },
                        agoraData: { clientRequest: startPayload },
                    });
                    return { resourceId, sid };
                });

            this._resourceid = resourceId;
            this._sid = sid;

            persistCloudRecordingData(this.roomUUID, { resourceId, sid });

            this._isRecording = true;
            this.startReportEndTime();
        } catch (e) {
            this._isRecording = false;
            throw e;
        }
    }

    public async stop(): Promise<CloudRecordStopResult> {
        window.clearTimeout(this._reportEndTimeTimeout);
        try {
            persistCloudRecordingData(this.roomUUID, null);
            const response = await cloudRecordStop({
                roomUUID: this.roomUUID,
                agoraParams: {
                    resourceid: this.resourceid,
                    mode: this.mode,
                    sid: this.sid,
                },
            });
            this._resourceid = null;
            this._sid = null;
            this._isRecording = false;
            return response;
        } catch (e) {
            this._isRecording = false;
            throw e;
        }
    }

    public async query(): Promise<CloudRecordQueryResult> {
        try {
            return cloudRecordQuery({
                roomUUID: this.roomUUID,
                agoraParams: {
                    resourceid: this.resourceid,
                    mode: this.mode,
                    sid: this.sid,
                },
            });
        } catch (e) {
            if (e.status === 404) {
                this._isRecording = false;
            }
            throw e;
        }
    }

    public async updateLayout(
        payload: CloudRecordUpdateLayoutPayload["agoraData"]["clientRequest"],
    ): Promise<CloudRecordUpdateLayoutResult> {
        return cloudRecordUpdateLayout({
            roomUUID: this.roomUUID,
            agoraParams: {
                resourceid: this.resourceid,
                mode: this.mode,
                sid: this.sid,
            },
            agoraData: { clientRequest: payload },
        });
    }

    /** Report endTime to flat server */
    private startReportEndTime(): void {
        this._reportEndTimeTimeout = window.setInterval(() => {
            if (this._isRecording) {
                void updateRecordEndTime(this.roomUUID);
            } else {
                window.clearInterval(this._reportEndTimeTimeout);
            }
        }, 10000);
    }
}

export default CloudRecording;

export interface CloudRecordingData {
    resourceId: string;
    sid: string;
}

function persistCloudRecordingData(
    id: string,
    setData?: CloudRecordingData | null,
): CloudRecordingData | null | undefined {
    let data: Record<string, CloudRecordingData | null>;
    try {
        data = JSON.parse(localStorage.getItem("recording_data") || "{}");
    } catch {
        data = {};
    }

    if (setData === undefined) {
        return data[id];
    }

    if (setData === null) {
        delete data[id];
    } else {
        data[id] = setData;
    }
    localStorage.setItem("recording_data", JSON.stringify(data));

    return setData;
}
