import {
    CloudFile,
    IServiceFileConvert,
    IServiceFileConvertStatus,
    IServiceFileConvertTask,
} from "@netless/flat-services";
import { queryH5ConvertingStatus } from "./h5-converting";

export class FileConvertH5 implements IServiceFileConvert {
    public async startConvert(_file: CloudFile): Promise<IServiceFileConvertTask | undefined> {
        // do nothing
        return;
    }

    public async queryStatus(file: CloudFile): Promise<IServiceFileConvertStatus> {
        return queryH5ConvertingStatus(file.fileURL);
    }
}
