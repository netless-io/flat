import { post } from "./utils";

export interface GenerateRTCTokenPayload {
    roomUUID: string;
}

export type GenerateRTCTokenResult = {
    token: string;
};

export async function generateRTCToken(roomUUID: string): Promise<string> {
    const { token } = await post<GenerateRTCTokenPayload, GenerateRTCTokenResult>(
        "agora/token/generate/rtc",
        {
            roomUUID,
        },
    );
    return token;
}

export type GenerateRTMTokenPayload = void;

export type GenerateRTMTokenResult = {
    token: string;
};

export async function generateRTMToken(): Promise<string> {
    const { token } = await post<GenerateRTMTokenPayload, GenerateRTMTokenResult>(
        "agora/token/generate/rtm",
        undefined,
    );
    return token;
}

export interface AgoraCloudRecordParamsBaseType {
    resourceid: string;
    mode: "individual" | "mix" | "web";
}

export interface AgoraCloudRecordParamsType extends AgoraCloudRecordParamsBaseType {
    sid: string;
}

export interface AgoraCloudRecordAcquireRequestBody {
    clientRequest: {
        resourceExpiredHour?: number;
        scene?: number;
    };
}

export interface AgoraCloudRecordAcquireResponse {
    resourceId: string;
}

export interface CloudRecordAcquirePayload {
    roomUUID: string;
    agoraData: AgoraCloudRecordAcquireRequestBody;
}

export interface CloudRecordAcquireResult {
    resourceId: string;
}

export function cloudRecordAcquire(
    payload: CloudRecordAcquirePayload,
): Promise<CloudRecordAcquireResult> {
    return post<CloudRecordAcquirePayload, CloudRecordAcquireResult>(
        "room/record/agora/acquire",
        payload,
    );
}

/**
 * @see {@link https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest?platform=RESTful}
 */
export interface AgoraCloudRecordStartRequestBody {
    clientRequest: {
        recordingConfig?: {
            /** 0 (messaging*) | 1 (broadcasting) */
            channelType?: number;
            /** 0 (audio) | 1 (video) | 2 (both*) */
            streamTypes?: number;
            /** 'individual' mode only, 'standard' is recommended */
            streamMode?: "default" | "standard" | "original";
            decryptionMode?: number;
            secret?: string;
            salt?: string;
            audioProfile?: number;
            /** 0 (HD video*) | 1 (small video) */
            videoStreamType?: number;
            /** seconds, default 30 */
            maxIdleTime?: number;
            /** 'mix' mode only */
            transcodingConfig?: {
                width: number;
                height: number;
                fps: number;
                bitrate: number;
                maxResolutionUid?: string;
                mixedVideoLayout?: number;
                backgroundColor?: string;
                defaultUserBackgroundImage?: string;
                layoutConfig?: Array<{
                    uid?: string;
                    x_axis?: number;
                    y_axis?: number;
                    width?: number;
                    height?: number;
                    alpha?: number;
                    render_mode?: number;
                }>;
                backgroundConfig?: Array<{
                    uid: string;
                    image_url: string;
                    render_mode?: number;
                }>;
            };
            subscribeVideoUids?: string[];
            unSubscribeVideoUids?: string[];
            subscribeAudioUids?: string[];
            unSubscribeAudioUids?: string[];
            subscribeUidGroup?: number;
            privateParams?: any;
        };
        recordingFileConfig?: {
            avFileType?: string[];
        };
        snapshotConfig?: {
            fileType: string[];
            captureInterval?: number;
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
            apiVersion?: string;
            errorHandlePolicy?: string;
        };
    };
}

export interface CloudRecordStartPayload {
    roomUUID: string;
    agoraParams: AgoraCloudRecordParamsBaseType;
    agoraData: AgoraCloudRecordStartRequestBody;
}

export interface CloudRecordStartResult {
    sid: string;
    resourceId: string;
}

/** {@link https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest?platform=RESTful} */
export function cloudRecordStart(
    payload: CloudRecordStartPayload,
): Promise<CloudRecordStartResult> {
    return post<CloudRecordStartPayload, CloudRecordStartResult>(
        "room/record/agora/started",
        payload,
    );
}

export interface AgoraCloudRecordQueryResponse<T extends "string" | "json" | undefined> {
    sid: string;
    resourceId: string;
    serverResponse: {
        fileListMode?: T;
        fileList?: T extends "string"
            ? string
            : T extends undefined
              ? undefined
              : Array<{
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
            serviceName: "aliyun_vod_service" | "web_recorder_service";
            payload: {
                state: "inProgress" | "idle";
                videoInfo:
                    | Array<{
                          fileName: string;
                          videoId: string;
                      }>
                    | Array<{
                          state: "inProgress" | "idle" | "exit";
                          fileList: Array<{
                              fileName: string;
                              sliceStartTime: string;
                          }>;
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

export interface CloudRecordQueryPayload {
    roomUUID: string;
    agoraParams: AgoraCloudRecordParamsType;
}

export type CloudRecordQueryResult = AgoraCloudRecordQueryResponse<"string" | "json" | undefined>;

/** {@link https://docs.agora.io/en/cloud-recording/restfulapi/#/Cloud%20Recording/query} */
export function cloudRecordQuery(
    payload: CloudRecordQueryPayload,
): Promise<CloudRecordQueryResult> {
    return post<CloudRecordQueryPayload, CloudRecordQueryResult>(
        "room/record/agora/query",
        payload,
    );
}

export interface AgoraCloudRecordLayoutConfigItem {
    uid?: string;
    x_axis: number;
    y_axis: number;
    width: number;
    height: number;
    alpha?: number;
    render_mode?: number;
}

export interface AgoraCloudRecordBackgroundConfigItem {
    uid: string;
    image_url: string;
    render_mode?: number;
}

export interface AgoraCloudRecordUpdateLayoutRequestBody {
    clientRequest?: {
        maxResolutionUid?: string;
        mixedVideoLayout?: number;
        backgroundColor?: string;
        layoutConfig?: AgoraCloudRecordLayoutConfigItem[];
        defaultUserBackgroundImage?: string;
        backgroundConfig?: AgoraCloudRecordBackgroundConfigItem[];
    };
}

export interface CloudRecordUpdateLayoutPayload {
    roomUUID: string;
    agoraParams: AgoraCloudRecordParamsType;
    agoraData: AgoraCloudRecordUpdateLayoutRequestBody;
}

export interface CloudRecordUpdateLayoutResult {
    sid: string;
    resourceId: string;
}

/** {@link https://docs.agora.io/en/cloud-recording/restfulapi/#/Cloud%20Recording/updateLayout} */
export function cloudRecordUpdateLayout(
    payload: CloudRecordUpdateLayoutPayload,
): Promise<CloudRecordUpdateLayoutResult> {
    return post<CloudRecordUpdateLayoutPayload, CloudRecordUpdateLayoutResult>(
        "room/record/agora/update-layout",
        payload,
    );
}

export interface CloudRecordStopPayload {
    roomUUID: string;
    agoraParams: AgoraCloudRecordParamsType;
}

export interface CloudRecordStopResult {
    sid: string;
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
        extensionServiceState?: {
            serviceName?: string;
            payload:
                | {
                      uploadingStatus: string;
                  }
                | {
                      state: string;
                      fileList: {
                          fileName: string;
                          sliceStartTime: string;
                      };
                  };
        };
    };
}

/** {@link https://docs.agora.io/en/cloud-recording/restfulapi/#/Cloud%20Recording/stop} */
export function cloudRecordStop(payload: CloudRecordStopPayload): Promise<CloudRecordStopResult> {
    return post<CloudRecordStopPayload, CloudRecordStopResult>(
        "room/record/agora/stopped",
        payload,
    );
}

export interface RTMCensorPayload {
    text: string;
}

export interface RTMCensorResult {
    valid: boolean;
}

export function checkRTMCensor(payload: RTMCensorPayload): Promise<RTMCensorResult> {
    return post<RTMCensorPayload, RTMCensorResult>("agora/rtm/censor", payload);
}

export interface AgoraAIBasePayload {
    request_id: string;
    channel_name: string;
    language: string;
    is_new: boolean;
}
export interface AgoraAIStartPayload extends AgoraAIBasePayload {
    user_uid: number;
    scene: string;
    role: string;
    bot_id?: number;
}

export interface AgoraAIResult {
    code: string;
    data: any;
    msg: string;
}
export async function agoraAIStart(payload: AgoraAIStartPayload): Promise<AgoraAIResult> {
    return post<AgoraAIStartPayload, AgoraAIResult>("agora/ai/start", payload);
}

export async function agoraAIPing(payload: AgoraAIBasePayload): Promise<any> {
    return post<AgoraAIBasePayload, AgoraAIResult>("agora/ai/ping", payload);
}

export async function agoraAIStop(payload: AgoraAIBasePayload): Promise<AgoraAIResult> {
    return post<AgoraAIBasePayload, AgoraAIResult>("agora/ai/stop", payload);
}
