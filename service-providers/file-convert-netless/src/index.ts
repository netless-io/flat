import { convertStart, FileConvertStep, ServerRequestError } from "@netless/flat-server-api";
import { IServiceFileConvert, IServiceFileConvertStatus, CloudFile } from "@netless/flat-services";
import { queryConvertingTaskStatus } from "./courseware-converting";
import { isPPTX } from "./utils";

export class FileConvertNetless implements IServiceFileConvert {
    public async startConvert(
        file: CloudFile,
    ): Promise<{ taskUUID: string; taskToken: string } | undefined> {
        try {
            const { taskUUID, taskToken } = await convertStart({
                fileUUID: file.fileUUID,
                isWhiteboardProjector: isPPTX(file.fileName),
            });
            return {
                taskUUID,
                taskToken,
            };
        } catch (e) {
            console.error(e);
        }
        return;
    }

    public async queryStatus(file: CloudFile): Promise<IServiceFileConvertStatus> {
        const { taskUUID, taskToken, region, resourceType } = file;
        const convertingStatus = await queryConvertingTaskStatus({
            taskUUID,
            taskToken,
            dynamic: isPPTX(file.fileName),
            region,
            projector: resourceType === "WhiteboardProjector",
        });

        if (convertingStatus.status === "Fail") {
            let error: Error;
            if (typeof convertingStatus.errorCode === "number") {
                const serverRequestError = new ServerRequestError(convertingStatus.errorCode);
                serverRequestError.errorMessage = convertingStatus.errorMessage || "";
                error = serverRequestError;
            } else {
                error = new Error(convertingStatus.errorMessage);
            }
            return { status: FileConvertStep.Failed, error };
        }

        if (convertingStatus.status === "Finished") {
            return { status: FileConvertStep.Done };
        }

        return { status: FileConvertStep.Converting };
    }
}
