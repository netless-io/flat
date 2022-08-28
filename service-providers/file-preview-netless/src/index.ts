import { IServiceFilePreview, CloudFile } from "@netless/flat-services";
import { StaticDocsViewer } from "./static-docs-viewer";

export class FilePreviewNetless implements IServiceFilePreview {
    public staticDocsViewer?: StaticDocsViewer;

    public async preview(file: CloudFile, container: HTMLElement): Promise<void> {
        await (this.staticDocsViewer ||= new StaticDocsViewer()).preview(file, container);
    }

    public async destroy(): Promise<void> {
        this.staticDocsViewer?.destroy();
    }
}
