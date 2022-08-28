import { CloudFile } from "@netless/flat-server-api";
import { IService } from "../../typing";

export interface IServiceFileInsertOptions {
    coord?: {
        clientX: number;
        clientY: number;
    };
}

export interface IServiceFileInsert extends IService {
    insert(file: CloudFile, options?: IServiceFileInsertOptions): Promise<any>;
}
