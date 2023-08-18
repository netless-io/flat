import { IServiceFilePreview, CloudFile } from "@netless/flat-services";
import { StaticDocsViewer } from "./static-docs-viewer";
import { Region } from "@netless/flat-server-api";

export class FilePreviewNetless implements IServiceFilePreview {
    public staticDocsViewer?: StaticDocsViewer;

    public constructor(public region: Region) {}

    public async preview(file: CloudFile, container: HTMLElement): Promise<void> {
        await (this.staticDocsViewer ||= new StaticDocsViewer(this.region)).preview(
            file,
            container,
        );
    }

    public async destroy(): Promise<void> {
        this.staticDocsViewer?.destroy();
    }
}
