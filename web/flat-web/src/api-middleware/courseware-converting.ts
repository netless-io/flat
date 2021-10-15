import Axios from "axios";
import { Region } from "flat-components";

export interface ConvertingTaskStatus {
    uuid: string;
    type: "static" | "dynamic";
    status: "Waiting" | "Converting" | "Finished" | "Fail";
    failedReason: string;
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

export async function queryConvertingTaskStatus({
    taskUUID,
    taskToken,
    dynamic,
    region,
}: {
    taskUUID: string;
    taskToken: string;
    dynamic: boolean;
    region: Region;
}): Promise<ConvertingTaskStatus> {
    const { data } = await Axios.get<ConvertingTaskStatus>(
        `https://api.netless.link/v5/services/conversion/tasks/${taskUUID}?type=${
            dynamic ? "dynamic" : "static"
        }`,
        { headers: { token: taskToken, region } },
    );
    return data;
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
