/**
 * 声网云录制
 * 因涉及到声网应用密钥，生产版本应该交由服务器处理
 */

const appId = process.env.AGORA_APP_ID
const restfulId = process.env.AGORA_RESTFUL_ID;
const restfulSecret = process.env.AGORA_RESTFUL_SECRET;
const apiServer = 'api.agora.io'

interface RequestPayloadBase {
    /** 待录制的频道名 */
    cname: string;
    /** 云端录制服务在频道内使用的 UID，用于标识该录制服务。取值范围 1 到 (232-1)，不可设置为 0。 */
    uid: string;
}

/** {@link https://docs.agora.io/cn/cloud-recording/restfulapi/#/云端录制/acquire} */
export interface AcquirePayload extends RequestPayloadBase {
    clientRequest: {
        resourceExpiredHour?: number;
    };
}

export interface AcquireResponse {
    resourceId: string;
}

/**
 * 获取录制资源 ID, 一个 resource ID 仅可用于一次录制，五分钟内需调用 start 开始录制。
 */
export async function acquire(payload: AcquirePayload): Promise<AcquireResponse> {
    return request("acquire", { body: JSON.stringify(payload) });
}

/** {@link https://docs.agora.io/cn/cloud-recording/restfulapi/#/云端录制/start} */
export interface StartPayload extends RequestPayloadBase {
    /** 通过 acquire 请求获取的 resource ID。 */
    resourceid: string;
    /**
     * 录制模式，支持单流模式 individual 和合流模式 mix （默认模式）。
     * - 单流模式下，分开录制频道内每个 UID 的音频流和视频流，每个 UID 均有其对应的音频文件和视频文件。
     * - 合流模式下，频道内所有 UID 的音视频混合录制为一个音视频文件。
     */
    mode: "individual" | "mix";
    clientRequest: {
        /**
         * 鉴权 toekn
         * @TODO 实现鉴权机制 {@link https://docs.agora.io/cn/Agora%20Platform/token?platform=All%20Platforms}
         */
        token?: string;
        recordingConfig: {
            /** 预估的订阅人数峰值。 */
            subscribeUidGroup: 0;
            channelType?: number;
            streamTypes?: number;
            decryptionMode?: number;
            secret?: string;
            audioProfile?: number;
            videoStreamType?: number;
            maxIdleTime?: number;
            transcodingConfig?: {
                width: number;
                height: number;
                fps: number;
                bitrate: number;
                maxResolutionUid?: string;
                mixedVideoLayout?: number;
                backgroundColor?: string;
                layoutConfig?: {
                    uid?: string;
                    x_axis?: number;
                    y_axis?: number;
                    width?: number;
                    height?: number;
                    alpha?: number;
                    render_mode?: string;
                };
            };
            subscribeVideoUids?: string[];
            unSubscribeVideoUids?: string[];
            subscribeAudioUids?: string[];
            unSubscribeAudioUids?: string[];
        };
        recordingFileConfig?: {
            avFileType?: string[];
        };
        snapshotConfig?: {
            fileType: string[];
            captureInterval?: number;
        };
        storageConfig?: {
            vendor: 2;
            region: 3;
            bucket: string;
            accessKey: string;
            secretKey: string;
            fileNamePrefix?: string[];
        };
        extensionServiceConfig?: {
            extensionServices: Array<{
                serviceName?: string;
                errorHandlePolicy?: string;
                serviceParam?: {
                    serviceParam: string;
                    secretKey: string;
                    regionId: string;
                    apiData: {
                        videoData: {
                            title: string;
                            description?: string;
                            coverUrl?: string;
                            cateId?: string;
                            tags?: string;
                            templateGroupId?: string;
                            userData?: string;
                            storageLocation?: string;
                            workflowI?: string;
                        };
                    };
                };
            }>;
            errorHandlePolicy?: string;
        };
    };
}

export interface StartResponse {
    /**
     * 录制 ID。
     * 成功开始云端录制后，你会得到一个 sid （录制 ID)。
     * 该 ID 是一次录制周期的唯一标识。
     */
    sid: string;
    resourceId: string;
}

/** 获取 resource ID 后，调用该方法开始云端录制 */
export function start({ resourceid, mode, ...payload }: StartPayload) {
    return request(`resourceid/${resourceid}/mode/${mode}/start`, {
        body: JSON.stringify(payload),
    });
}

async function request<R = any>(action: string, config: RequestInit = {}): Promise<R> {
    const response = await fetch(`https://${apiServer}/v1/apps/${appId}/cloud_recording/${action}`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa(`${restfulId}:${restfulSecret}`),
            "Content-Type": "application/json",
            ...(config.headers || {}),
        },
        ...config,
    });
    if (!response.ok) {
        throw response;
    }
    return response.json();
}
