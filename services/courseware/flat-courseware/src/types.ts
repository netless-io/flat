import type { CloudFile } from "@netless/flat-server-api";

export type FlatCoursewareFile = Pick<
    CloudFile,
    "fileUUID" | "fileName" | "fileSize" | "fileURL" | "createAt" | "external" | "taskUUID"
>;
