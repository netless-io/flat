import Axios from "axios";
import { Region } from "flat-components";
import { ConvertingTaskStatus, ConvertingTaskStatusLegacy } from "@netless/flat-server-api";

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
        const { data } = await Axios.get<ConvertingTaskStatus>(
            `https://api.netless.link/v5/projector/tasks/${taskUUID}`,
            { headers: { token: taskToken, region } },
        );
        return data;
    } else {
        const { data } = await Axios.get<ConvertingTaskStatusLegacy>(
            `https://api.netless.link/v5/services/conversion/tasks/${taskUUID}?type=${
                dynamic ? "dynamic" : "static"
            }`,
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
