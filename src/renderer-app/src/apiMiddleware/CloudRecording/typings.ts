interface RequestPayloadBase {
    /** 待录制的频道名 */
    cname?: string;
    /** 云端录制服务在频道内使用的 UID，用于标识该录制服务。取值范围 1 到 (232-1)，不可设置为 0。 */
    uid?: string;
}

export interface RequestPayload extends RequestPayloadBase {
    /** 待录制的频道名 */
    cname?: string;
    /** 云端录制服务在频道内使用的 UID，用于标识该录制服务。取值范围 1 到 (232-1)，不可设置为 0。 */
    uid?: string;
    clientRequest?: {};
}

/** {@link https://docs.agora.io/cn/cloud-recording/restfulapi/#/云端录制/acquire} */
export interface AcquirePayload extends RequestPayloadBase {
    clientRequest?: {
        resourceExpiredHour?: number;
    };
}

export interface AcquireResponse {
    /** 云端录制使用的 resource ID。 */
    resourceId: string;
}

/** {@link https://docs.agora.io/cn/cloud-recording/restfulapi/#/云端录制/start} */
export interface StartPayload extends RequestPayloadBase {
    /** 通过 acquire 请求获取的 resource ID。 */
    resourceid?: string;
    clientRequest: {
        /**
         * 鉴权 toekn
         * @TODO 实现鉴权机制 {@link https://docs.agora.io/cn/Agora%20Platform/token?platform=All%20Platforms}
         */
        token?: string;
        recordingConfig: {
            channelType?: 0 | 1;
            streamTypes?: 0 | 1 | 2;
            decryptionMode?: 0 | 1 | 2 | 3;
            secret?: string;
            audioProfile?: 0 | 1 | 2;
            videoStreamType?: 0 | 1;
            maxIdleTime?: number;
            transcodingConfig?: {
                width: number;
                height: number;
                fps: number;
                bitrate: number;
                maxResolutionUid?: string;
                mixedVideoLayout?: 0 | 1 | 2 | 3;
                backgroundColor?: string;
                layoutConfig?: Array<{
                    uid?: string;
                    x_axis?: number;
                    y_axis?: number;
                    width?: number;
                    height?: number;
                    alpha?: number;
                    render_mode?: number;
                }>;
            };
            subscribeVideoUids?: string[];
            unSubscribeVideoUids?: string[];
            subscribeAudioUids?: string[];
            unSubscribeAudioUids?: string[];
            /** 预估的订阅人数峰值。 */
            subscribeUidGroup: 0 | 1 | 2 | 3;
        };
        recordingFileConfig?: {
            avFileType?: string[];
        };
        snapshotConfig?: {
            fileType: string[];
            captureInterval?: number;
        };
        storageConfig?: {
            vendor: number;
            region: number;
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
    /** 云端录制使用的 resource ID。 */
    resourceId: string;
}

/** {@link https://docs.agora.io/cn/cloud-recording/restfulapi/#/云端录制/update} */
export interface UpdatePayload extends RequestPayloadBase {
    /** 通过 acquire 请求获取的 resource ID。 */
    resourceid?: string;
    /** 通过 start 请求获取的录制 ID。 */
    sid?: string;
    clientRequest?: {
        streamSubscribe?: {
            audioUidList?: {
                subscribeAudioUids?: string[];
                unSubscribeAudioUids?: string[];
            };
            videoUidList?: {
                subscribeVideoUids?: string[];
                unSubscribeVideoUids?: string[];
            };
        };
    };
}

export interface UpdateResponse {
    /**
     * 录制 ID。
     * 成功开始云端录制后，你会得到一个 sid （录制 ID)。
     * 该 ID 是一次录制周期的唯一标识。
     */
    sid: string;
    /** 云端录制使用的 resource ID。 */
    resourceId: string;
}

/** {@link https://docs.agora.io/cn/cloud-recording/restfulapi/#/云端录制/updateLayout} */
export interface UpdateLayoutPayload extends RequestPayloadBase {
    /** 通过 acquire 请求获取的 resource ID。 */
    resourceid?: string;
    /** 通过 start 请求获取的录制 ID。 */
    sid?: string;
    clientRequest?: {
        maxResolutionUid?: string;
        mixedVideoLayout?: 0 | 1 | 2 | 3;
        backgroundColor?: string;
        layoutConfig?: Array<{
            uid?: string;
            x_axis: number;
            y_axis: number;
            width: number;
            height: number;
            alpha?: number;
            render_mode?: number;
        }>;
    };
}

export interface UpdateLayoutResponse {
    /**
     * 录制 ID。
     * 成功开始云端录制后，你会得到一个 sid （录制 ID)。
     * 该 ID 是一次录制周期的唯一标识。
     */
    sid: string;
    /** 云端录制使用的 resource ID。 */
    resourceId: string;
}

/** {@link https://docs.agora.io/cn/cloud-recording/restfulapi/#/云端录制/query} */
export interface QueryPayload {
    /** 通过 acquire 请求获取的 resource ID。 */
    resourceid?: string;
    /** 通过 start 请求获取的录制 ID。 */
    sid?: string;
}

export interface QueryResponseStringMode {
    /**
     * 录制 ID。
     * 成功开始云端录制后，你会得到一个 sid （录制 ID)。
     * 该 ID 是一次录制周期的唯一标识。
     */
    sid: string;
    /** 云端录制使用的 resource ID。 */
    resourceId: string;
    serverResponse: {
        fileListMode?: "string";
        fileList?: string;
        status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 20;
        sliceStartTime: string;
        extensionServiceState: Array<{
            serviceName: string;
            payload: {
                state: "inProgress" | "idle";
                videoInfo: Array<{
                    fileName: string;
                    videoId: string;
                }>;
            };
        }>;
        subServiceStatus: {
            recordingService:
                | "serviceIdle"
                | "serviceStarted"
                | "serviceReady"
                | "serviceInProgress"
                | "serviceCompleted"
                | "servicePartialCompleted"
                | "serviceValidationFailed"
                | "serviceAbnormal";
        };
    };
}

export interface QueryResponseJsonMode {
    /**
     * 录制 ID。
     * 成功开始云端录制后，你会得到一个 sid （录制 ID)。
     * 该 ID 是一次录制周期的唯一标识。
     */
    sid: string;
    /** 云端录制使用的 resource ID。 */
    resourceId: string;
    serverResponse: {
        fileListMode?: "json";
        fileList?: Array<{
            filename: string;
            trackType: "audio" | "video" | "audio_and_video";
            uid: string;
            mixedAllUser: boolean;
            isPlayable: boolean;
            sliceStartTime: number;
        }>;
        status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 20;
        sliceStartTime: string;
        extensionServiceState: Array<{
            serviceName: string;
            payload: {
                state: "inProgress" | "idle";
                videoInfo: Array<{
                    fileName: string;
                    videoId: string;
                }>;
            };
        }>;
        subServiceStatus: {
            recordingService:
                | "serviceIdle"
                | "serviceStarted"
                | "serviceReady"
                | "serviceInProgress"
                | "serviceCompleted"
                | "servicePartialCompleted"
                | "serviceValidationFailed"
                | "serviceAbnormal";
        };
    };
}

export type QueryResponse = QueryResponseStringMode | QueryResponseJsonMode;

/** {@link https://docs.agora.io/cn/cloud-recording/restfulapi/#/云端录制/stop} */
export interface StopPayload extends RequestPayloadBase {
    /** 通过 acquire 请求获取的 resource ID。 */
    resourceid?: string;
    /** 通过 start 请求获取的录制 ID。 */
    sid?: string;
    clientRequest?: {};
}

export interface StopResponseStringMode {
    /**
     * 录制 ID。
     * 成功开始云端录制后，你会得到一个 sid （录制 ID)。
     * 该 ID 是一次录制周期的唯一标识。
     */
    sid: string;
    /** 云端录制使用的 resource ID。 */
    resourceId: string;
    serverResponse: {
        fileListMode?: "string";
        fileList?: string;
        uploadingStatus: "uploaded" | "backuped" | "unknown";
    };
}

export interface StopResponseJsonMode {
    /**
     * 录制 ID。
     * 成功开始云端录制后，你会得到一个 sid （录制 ID)。
     * 该 ID 是一次录制周期的唯一标识。
     */
    sid: string;
    /** 云端录制使用的 resource ID。 */
    resourceId: string;
    serverResponse: {
        fileListMode?: "json";
        fileList?: Array<{
            filename: string;
            trackType: "audio" | "video" | "audio_and_video";
            uid: string;
            mixedAllUser: boolean;
            isPlayable: boolean;
            sliceStartTime: number;
        }>;
        uploadingStatus: "uploaded" | "backuped" | "unknown";
    };
}

export type StopResponse = StopResponseStringMode | StopResponseJsonMode;
