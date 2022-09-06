import { CloudFile } from "@netless/flat-server-api";
import { IService } from "../typing";

import { IServiceFileConvert } from "./file-convert";
import { IServiceFileInsert } from "./file-insert";
import { IServiceFilePreview } from "./file-preview";

export * from "./file-convert";
export * from "./file-preview";
export * from "./file-insert";
export * from "./utils";

export type { CloudFile } from "@netless/flat-server-api";
export { FileConvertStep } from "@netless/flat-server-api";
export { FileResourceType } from "@netless/flat-server-api";

export type IServiceFileExtensions =
    | "jpg"
    | "jpeg"
    | "png"
    | "webp"
    | "mp3"
    | "mp4"
    | "doc"
    | "docx"
    | "ppt"
    | "pptx"
    | "pdf";

export type IServiceFileCatalog = {
    [K in `file-convert:${IServiceFileExtensions}`]: IServiceFileConvert;
} & {
    [K in `file-insert:${IServiceFileExtensions}`]: IServiceFileInsert;
} & {
    [K in `file-preview:${IServiceFileExtensions}`]: IServiceFilePreview;
};

export interface IServiceFile extends IService {
    insert(file: CloudFile): Promise<void>;
    preview(file: CloudFile): Promise<void>;
}
