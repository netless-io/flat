import {
    convertStart,
    FileConvertStep,
    FileResourceType,
    ServerRequestError,
} from "@netless/flat-server-api";
import { IServiceFileConvert, IServiceFileConvertStatus, CloudFile } from "@netless/flat-services";
import { queryConvertingTaskStatus } from "./courseware-converting";
import { isPPTX } from "./utils";

export * from "./courseware-converting";
export * from "./utils";

export class FileConvertNetless implements IServiceFileConvert {
    public async startConvert(
        file: CloudFile,
    ): Promise<
        { taskUUID: string; taskToken: string; resourceType: FileResourceType } | undefined
    > {
        try {
            const {
                resourceType,
                whiteboardProjector: { taskUUID, taskToken },
            } = await convertStart({
                fileUUID: file.fileUUID,
            });

            return {
                taskUUID,
                taskToken,
                resourceType,
            };
        } catch (e) {
            console.error(e);
        }
        return;
    }

    public async queryStatus(file: CloudFile): Promise<IServiceFileConvertStatus> {
        if (
            file.resourceType === "WhiteboardConvert" ||
            file.resourceType === "WhiteboardProjector"
        ) {
            const convertingStatus = await queryConvertingTaskStatus({
                dynamic: isPPTX(file.fileName),
                resourceType: file.resourceType,
                meta: file.meta,
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
        return { status: FileConvertStep.None };
    }
}
