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

    private _resourceid: string | null = null;
    private _sid: string | null = null;
    private _isRecording = false;

    private _reportEndTimeTimeout = NaN;

    public constructor(init: { roomUUID: string }) {
        this.roomUUID = init.roomUUID;
    }

    public async start(
        startPayload: CloudRecordStartPayload["agoraData"]["clientRequest"] = {
            recordingConfig: {
                subscribeUidGroup: 0,
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
        if (this._isRecording) {
            return;
        }

        this._isRecording = true;
        try {
            const { resourceId } = await cloudRecordAcquire({
                roomUUID: this.roomUUID,
                agoraData: { clientRequest: acquirePayload },
            });
            this._resourceid = resourceId;

            const { sid } = await cloudRecordStart({
                roomUUID: this.roomUUID,
                agoraParams: {
                    resourceid: this.resourceid,
                    mode: this.mode,
                },
                agoraData: { clientRequest: startPayload },
            });
            this._sid = sid;
            this.startReportEndTime();
        } catch (e) {
            this._isRecording = false;
            throw e;
        }
    }

    public async stop(): Promise<CloudRecordStopResult> {
        window.clearTimeout(this._reportEndTimeTimeout);
        try {
            const response = await cloudRecordStop({
                roomUUID: this.roomUUID,
                agoraParams: {
                    resourceid: this.resourceid,
                    mode: this.mode,
                    sid: this.sid,
                },
            });
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
