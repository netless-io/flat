import { Region } from "@netless/flat-server-api";

export interface ConvertingTaskStatus {
    uuid: string;
    type: "static" | "dynamic";
    status: "Waiting" | "Converting" | "Finished" | "Fail" | "Abort";
    errorCode?: string;
    errorMessage?: string;
    convertedPercentage?: number;
    prefix?: string;
    // TODO: `progress` is for static resources and will be changed in the future.
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
    projector: boolean;
}

export async function queryConvertingTaskStatus(
    params: QueryConvertingParams,
): Promise<ConvertingTaskStatus> {
    const { taskUUID, taskToken, dynamic, region, projector } = params;
    if (projector) {
        const response = await fetch(`https://api.netless.link/v5/projector/tasks/${taskUUID}`, {
            headers: { token: taskToken, region },
        });
        return response.json();
    } else {
        const response = await fetch(
            `https://api.netless.link/v5/services/conversion/tasks/${taskUUID}?type=${
                dynamic ? "dynamic" : "static"
            }`,
            { headers: { token: taskToken, region } },
        );
        const data = await response.json();
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
    const response = await fetch(`${baseURL}/${pptType}Convert/${taskUUID}.zip`);
    return response.blob();
}

export function extractLegacySlideUrlPrefix(fullUrl?: string): string | undefined {
    if (!fullUrl || !fullUrl.startsWith("ppt")) {
        return undefined;
    }

    // e.g. "ppt(x)://cdn/prefix/dynamicConvert/{taskId}/1.slide"
    const pptSrcRE = /^pptx?(?<prefix>:\/\/\S+?dynamicConvert)\/(?<taskId>\w+)\//;

    const match = pptSrcRE.exec(fullUrl);
    if (!match || !match.groups) {
        return undefined;
    }

    return "https" + match.groups.prefix;
}
