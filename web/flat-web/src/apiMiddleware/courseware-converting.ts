import Axios from "axios";

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
}: {
    taskUUID: string;
    taskToken: string;
    dynamic: boolean;
}): Promise<ConvertingTaskStatus> {
    const { data } = await Axios.get<ConvertingTaskStatus>(
        `https://api.netless.link/v5/services/conversion/tasks/${taskUUID}?type=${
            dynamic ? "dynamic" : "static"
        }`,
        { headers: { token: taskToken /* TODO:, region: 'cn-hz' */ } },
    );
    return data;
}
