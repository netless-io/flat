import Chance from "chance";
import faker from "faker";

import { CloudFile, FileConvertStep, FileResourceType, Region } from "@netless/flat-server-api";

const chance = new Chance();

export function randomCloudFile(file: Partial<CloudFile> = {}): CloudFile {
    return {
        fileUUID: faker.datatype.uuid(),
        fileName: faker.random.word() + "." + faker.system.commonFileExt(),
        fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
        createAt: faker.date.past(),
        fileURL: faker.internet.url(),
        resourceType: FileResourceType.NormalResources,
        meta: {
            whiteboardProjector: {
                taskToken: faker.random.word(),
                taskUUID: faker.random.word(),
                convertStep: chance.pickone([
                    FileConvertStep.None,
                    FileConvertStep.Converting,
                    FileConvertStep.Done,
                    FileConvertStep.Failed,
                ]),
                region: Region.CN_HZ,
            },
        },
        ...file,
    };
}
