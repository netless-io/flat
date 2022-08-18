import { v4 as uuidv4 } from "uuid";
import { CloudFile, FileConvertStep, Region } from "@netless/flat-server-api";

export function createCloudFile(file: Partial<CloudFile>): CloudFile {
    return {
        fileUUID: uuidv4(),
        fileName: "",
        fileSize: 0,
        fileURL: "",
        convertStep: FileConvertStep.Done,
        taskUUID: uuidv4(),
        taskToken: "",
        region: Region.CN_HZ,
        external: false,
        resourceType: "NormalResources",
        createAt: new Date(),
        ...file,
    };
}
