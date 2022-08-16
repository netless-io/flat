import Chance from "chance";
import faker from "faker";

import { CloudFile, FileConvertStep, FileResourceType, Region } from "@netless/flat-server-api";

const chance = new Chance();

export function randomCloudFile(file: Partial<CloudFile> = {}): CloudFile {
    return {
        fileUUID: faker.datatype.uuid(),
        fileName: faker.random.word() + "." + faker.system.commonFileExt(),
        fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
        convertStep: chance.pickone([
            FileConvertStep.None,
            FileConvertStep.Converting,
            FileConvertStep.Done,
            FileConvertStep.Failed,
        ]),
        createAt: faker.date.past(),
        fileURL: faker.internet.url(),
        taskToken: faker.random.word(),
        taskUUID: faker.random.word(),
        region: Region.CN_HZ,
        external: faker.datatype.boolean(),
        resourceType: FileResourceType.NormalResources,
        ...file,
    };
}
