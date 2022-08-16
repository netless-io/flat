import { CloudFile } from "@netless/flat-server-api";
import { IService } from "../../typing";

export interface IServiceFilePreview extends IService {
    preview(file: CloudFile, container: HTMLElement): Promise<any>;
}
