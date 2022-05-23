import Axios from "axios";
import { Region } from "flat-components";

export interface ConvertingTaskStatus {
    uuid: string;
    type: "static" | "dynamic";
    status: "Waiting" | "Converting" | "Finished" | "Fail" | "Abort";
    errorCode?: string;
    errorMessage?: string;
    convertedPercentage?: number;
    prefix?: string;
    progress?: ConvertingTaskStatusLegacy["progress"];
}

export interface ConvertingTaskStatusLegacy {
    uuid: string;
    type: "static" | "dynamic";
    status: "Waiting" | "Converting" | "Finished" | "Fail" | "Abort";
    failedReason?: string;
    progress?: {
        totalPageSize: number;
        convertedPageSize: number;
        convertedPercentage: number;
        convertedFileList: Array<{
            width: number;
            height: number;
            conversionFileUrl: string;
            preview?: string;
        }>;
        currentStep: "Extracting" | "Packaging" | "GeneratingPreview" | "MediaTranscode";
    };
}

export interface QueryConvertingParams {
    taskUUID: string;
    taskToken: string;
    region: Region;
    dynamic: boolean;
}

export async function queryConvertingTaskStatus(
    params: QueryConvertingParams,
): Promise<ConvertingTaskStatus> {
    const { taskUUID, taskToken, dynamic, region } = params;
    if (dynamic) {
        const { data } = await Axios.get<ConvertingTaskStatus>(
            `https://api.netless.link/v5/projector/tasks/${taskUUID}`,
            { headers: { token: taskToken, region } },
        );
        return data;
    } else {
        const { data } = await Axios.get<ConvertingTaskStatusLegacy>(
            `https://api.netless.link/v5/services/conversion/tasks/${taskUUID}?type=static`,
            { headers: { token: taskToken, region } },
        );
        const prefix = data.progress?.convertedFileList?.[0]?.conversionFileUrl || "";
        const index = prefix.lastIndexOf("/staticConvert") + 1;
        const transformed: ConvertingTaskStatus = {
            uuid: data.uuid,
            type: data.type,
            status: data.status,
            errorMessage: data.failedReason,
            convertedPercentage: data.progress?.convertedPercentage,
            prefix: prefix ? prefix.slice(0, index) : undefined,
            progress: data.progress,
        };
        return transformed;
    }
}

export async function getZipData({
    baseURL,
    pptType,
    taskUUID,
}: {
    baseURL: string;
    pptType: "static" | "dynamic";
    taskUUID: string;
}): Promise<Blob> {
    const { data } = await Axios.get<Blob>(`${baseURL}/${pptType}Convert/${taskUUID}.zip`, {
        responseType: "blob",
    });

    return data;
}
