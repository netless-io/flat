import { CloudFile } from "@netless/flat-server-api";
import { IService } from "../../typing";

export interface IServiceFileInsert extends IService {
    insert(file: CloudFile): Promise<any>;
}
