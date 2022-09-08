import { CloudFile } from "@netless/flat-server-api";
import { v4 as uuidv4 } from "uuid";

export function createCloudFile(file: Partial<CloudFile>): CloudFile {
    return {
        fileUUID: uuidv4(),
        fileName: "",
        fileSize: 0,
        fileURL: "",
        resourceType: "NormalResources",
        createAt: new Date(),
        meta: {},
        ...file,
    };
}
