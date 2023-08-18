import { previewSlide, SlideViewer } from "@netless/app-slide";
import { Region } from "@netless/flat-server-api";
import { queryConvertingTaskStatus } from "@netless/flat-service-provider-file-convert-netless";
import { CloudFile, IServiceFilePreview, FileResourceType } from "@netless/flat-services";

export class FilePreviewNetlessSlide implements IServiceFilePreview {
    public slideViewer?: SlideViewer;

    public constructor(public readonly region: Region) {}

    public async preview(file: CloudFile, container: HTMLElement): Promise<any> {
        if (this.slideViewer) {
            this.slideViewer.destroy();
        }

        if (
            file.resourceType === FileResourceType.WhiteboardConvert ||
            file.resourceType === FileResourceType.WhiteboardProjector
        ) {
            const result = await queryConvertingTaskStatus({
                dynamic: true,
                resourceType: file.resourceType,
                meta: file.meta,
                region: this.region,
            });

            this.slideViewer = previewSlide({
                container: container,
                taskId: result.uuid,
                url:
                    result.prefix ||
                    extractLegacySlideUrlPrefix(
                        result.progress?.convertedFileList[0].conversionFileUrl,
                    ),
            });
        }
    }

    public async destroy(): Promise<void> {
        this.slideViewer?.destroy();
    }
}

function extractLegacySlideUrlPrefix(fullUrl?: string): string | undefined {
    if (!fullUrl || !fullUrl.startsWith("ppt")) {
        return undefined;
    }

    // e.g. "ppt(x)://cdn/prefix/dynamicConvert/{taskId}/1.slide"
    const pptSrcRE = /^pptx?(:\/\/\S+?dynamicConvert)\/(\w+)\//;

    const match = pptSrcRE.exec(fullUrl);
    if (!match) {
        return undefined;
    }

    return "https" + match[1];
}
