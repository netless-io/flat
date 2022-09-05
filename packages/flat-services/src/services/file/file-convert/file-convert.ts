import type { CloudFile, FileConvertStep, FileResourceType } from "@netless/flat-server-api";
import { IService } from "../../typing";

export interface IServiceFileConvertStatus {
    status: FileConvertStep;
    error?: Error;
}

export interface IServiceFileConvertTask {
    taskUUID: string;
    taskToken: string;
    resourceType: FileResourceType;
}

export interface IServiceFileConvert extends IService {
    startConvert(file: CloudFile): Promise<IServiceFileConvertTask | undefined>;

    queryStatus(file: CloudFile): Promise<IServiceFileConvertStatus>;
}
