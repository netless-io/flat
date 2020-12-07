import * as CR from "./typings";
export * from "./typings";

/**
 * 声网云录制
 * 因涉及到声网 RESTful 密钥，生产版本应该交由服务器处理
 */
export class CloudRecording {
    public apiServer = "api.agora.io";

    public appId = process.env.AGORA_APP_ID;
    public restfulId = process.env.AGORA_RESTFUL_ID;
    public restfulSecret = process.env.AGORA_RESTFUL_SECRET;

    /**
     * 录制模式，支持单流模式 individual 和合流模式 mix （默认模式）。
     * - 单流模式下，分开录制频道内每个 UID 的音频流和视频流，每个 UID 均有其对应的音频文件和视频文件。
     * - 合流模式下，频道内所有 UID 的音视频混合录制为一个音视频文件。
     */
    public mode: "individual" | "mix" = "mix";

    /** 待录制的频道名 */
    public get cname(): string {
        if (this._cname === null || this._cname === undefined) {
            throw new Error("Channal name is not set.");
        }
        return this._cname;
    }

    /** 云端录制服务在频道内使用的 UID，用于标识该录制服务。取值范围 1 到 (232-1)，不可设置为 0。 */
    public get uid(): string {
        if (this._uid === null || this._uid === undefined) {
            throw new Error("UID is not set.");
        }
        return this._uid;
    }

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

    public _cname: string | null = null;
    public _uid: string | null = null;
    public _resourceid: string | null = null;
    public _sid: string | null = null;

    public get isRecording() {
        return this._isRecording;
    }

    private _isRecording = false;

    public constructor(init: {
        /** 待录制的频道名 */
        cname?: string;
        /** 云端录制服务在频道内使用的 UID，用于标识该录制服务。取值范围 1 到 (232-1)，不可设置为 0。 */
        uid?: string;
    }) {
        if (init.cname !== undefined) {
            this._cname = init.cname;
        }
        if (init.uid !== undefined) {
            this._uid = init.uid;
        }
    }

    public defaultStorageConfig() {
        return {
            vendor: 2, // 阿里云
            region: 0, // 杭州
            bucket: process.env.AGORA_OSS_BUCKET || "",
            accessKey: process.env.AGORA_OSS_ACCESS_KEY_ID || "",
            secretKey: process.env.AGORA_OSS_ACCESS_KEY_SECRET || "",
            fileNamePrefix: [process.env.AGORA_OSS_FOLDER || ""],
        };
    }

    /** 开始录制 */
    public async start(
        startPayload: CR.StartPayload["clientRequest"] = {
            storageConfig: this.defaultStorageConfig(),
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
        acquirePayload: CR.AcquirePayload["clientRequest"] = {
            resourceExpiredHour: 1,
        },
    ): Promise<void> {
        if (this._isRecording) {
            return;
        }

        this._isRecording = true;
        try {
            await this._acquire({ clientRequest: acquirePayload });
            await this._start({ clientRequest: startPayload });
        } catch (e) {
            this._isRecording = false;
            throw e;
        }
    }

    /** 停止录制 */
    public async stop(): Promise<CR.StopResponse> {
        try {
            const response = await this._stop();
            this._isRecording = false;
            return response;
        } catch (e) {
            this._isRecording = false;
            throw e;
        }
    }

    /** 查询录制状态 */
    public async query(): Promise<CR.QueryResponse> {
        try {
            return this._query();
        } catch (e) {
            if (e.status === 404) {
                this._isRecording = false;
            }
            throw e;
        }
    }

    public async update(payload?: CR.UpdatePayload["clientRequest"]): Promise<CR.UpdateResponse> {
        return this._update({ clientRequest: payload });
    }

    public async updateLayout(
        payload?: CR.UpdateLayoutPayload["clientRequest"],
    ): Promise<CR.UpdateLayoutResponse> {
        return this._updateLayout({ clientRequest: payload });
    }

    /**
     * 获取录制资源 ID, 一个 resource ID 仅可用于一次录制，五分钟内需调用 start 开始录制。
     */
    public async _acquire(payload: CR.AcquirePayload = {}): Promise<CR.AcquireResponse> {
        const response = await this.request<CR.AcquireResponse>("acquire", payload);
        this._resourceid = response.resourceId;
        return response;
    }

    /** 获取 resource ID 后，调用该方法开始云端录制 */
    public async _start({ resourceid, ...payload }: CR.StartPayload): Promise<CR.StartResponse> {
        const response = await this.request<Promise<CR.StartResponse>>(
            `resourceid/${resourceid || this.resourceid}/mode/${this.mode}/start`,
            payload,
        );
        this._sid = response.sid;
        return response;
    }

    /** 在录制过程中，可以随时调用该方法更新订阅的 UID 名单。 */
    public _update({ resourceid, sid, ...payload }: CR.UpdatePayload = {}): Promise<
        CR.UpdateResponse
    > {
        return this.request(
            `resourceid/${resourceid || this.resourceid}/sid/${sid || this.sid}/mode/${
                this.mode
            }/update`,
            payload,
        );
    }

    /** 在录制过程中，可以随时调用该方法更新合流布局的设置。 */
    public _updateLayout({ resourceid, sid, ...payload }: CR.UpdateLayoutPayload = {}): Promise<
        CR.UpdateLayoutResponse
    > {
        return this.request(
            `resourceid/${resourceid || this.resourceid}/sid/${sid || this.sid}/mode/${
                this.mode
            }/updateLayout`,
            payload,
        );
    }

    /**
     * 开始录制后，你可以调用 query 查询录制状态。
     * query 请求仅在会话内有效。如果录制启动错误，或录制已结束，调用 query 将返回 404。
     */
    public _query({ resourceid, sid }: CR.QueryPayload = {}): Promise<CR.QueryResponse> {
        return this.request(
            `resourceid/${resourceid || this.resourceid}/sid/${sid || this.sid}/mode/${
                this.mode
            }/query`,
            null,
            {
                method: "GET",
            },
        );
    }

    /**
     * 录制完成后，调用该方法离开频道，停止录制。
     * 录制停止后如需再次录制，必须再调用 acquire 方法请求一个新的 resource ID。
     */
    public _stop({ resourceid, sid, ...payload }: CR.StopPayload = {}): Promise<CR.StopResponse> {
        return this.request(
            `resourceid/${resourceid || this.resourceid}/sid/${sid || this.sid}/mode/${
                this.mode
            }/stop`,
            payload,
        );
    }

    private async request<R = any>(
        action: string,
        payload: CR.RequestPayload | null,
        config: any = {},
    ): Promise<R> {
        const response = await fetch(
            `https://${this.apiServer}/v1/apps/${this.appId}/cloud_recording/${action}`,
            {
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa(`${this.restfulId}:${this.restfulSecret}`),
                    "Content-Type": "application/json",
                    ...(config.headers || {}),
                },
                body:
                    payload === null
                        ? void 0
                        : JSON.stringify({
                              cname: payload.cname || this.cname,
                              uid: payload.uid || this.uid,
                              clientRequest: payload.clientRequest || {},
                          }),
                ...config,
            },
        );
        if (!response.ok) {
            throw response;
        }
        return response.json();
    }
}

export default CloudRecording;
