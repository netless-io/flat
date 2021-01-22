import { AGORA } from "../constants/Process";
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
 * 声网云录制
 */
export class CloudRecording {
    /**
     * 录制模式，支持单流模式 individual 和合流模式 mix （默认模式）。
     * - 单流模式下，分开录制频道内每个 UID 的音频流和视频流，每个 UID 均有其对应的音频文件和视频文件。
     * - 合流模式下，频道内所有 UID 的音视频混合录制为一个音视频文件。
     */
    public mode: "individual" | "mix" = "mix";

    /** 待录制的频道名 */
    public roomUUID: string;

    /** 通过 acquire 请求获取的 resource ID。 */
    public get resourceid(): string {
        if (this._resourceid === null || this._resourceid === undefined) {
            throw new Error("No resourceid. Use `couldRecording.acquire` to acquire one.");
        }
        return this._resourceid;
    }

    /** 通过 start 请求获取的录制 ID。 */
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

    public constructor(init: {
        /** 待录制的频道名 */
        roomUUID: string;
    }) {
        this.roomUUID = init.roomUUID;
    }

    public defaultStorageConfig(): {
        vendor: number;
        region: number;
        bucket: string;
        accessKey: string;
        secretKey: string;
        fileNamePrefix: string[];
    } {
        return {
            vendor: 2, // 阿里云
            region: 0, // 杭州
            bucket: AGORA.OSS_BUCKET,
            accessKey: AGORA.OSS_ACCESS_KEY_ID,
            secretKey: AGORA.OSS_ACCESS_KEY_SECRET,
            fileNamePrefix: [AGORA.OSS_FOLDER],
        };
    }

    /**
     * 开始录制
     *
     * 获取录制资源 ID, 一个 resource ID 仅可用于一次录制，五分钟内需调用 start 开始录制。
     * 获取 resource ID 后，调用该方法开始云端录制。
     *
     */
    public async start(
        startPayload: CloudRecordStartPayload["agoraData"]["clientRequest"] = {
            recordingConfig: {
                subscribeUidGroup: 0,
                transcodingConfig: {
                    width: 640,
                    height: 360,
                    fps: 15,
                    bitrate: 500,
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
        } catch (e) {
            this._isRecording = false;
            throw e;
        }
    }

    /** 停止录制 */
    public async stop(): Promise<CloudRecordStopResult> {
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

    /**
     * 开始录制后，你可以调用 query 查询录制状态。
     * query 请求仅在会话内有效。如果录制启动错误，或录制已结束，调用 query 将返回 404。
     */
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

    /** 在录制过程中，可以随时调用该方法更新合流布局的设置。 */
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
}

export default CloudRecording;
