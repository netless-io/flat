import "./DynamicPreview.less";

import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Region } from "flat-components";
import { previewSlide, SlidePreviewer } from "@netless/app-slide";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { queryConvertingTaskStatus } from "../../../api-middleware/courseware-converting";

export interface DynamicPreviewProps {
    taskUUID: string;
    taskToken: string;
    region: Region;
}

export const DynamicPreview = observer<DynamicPreviewProps>(function PPTPreview({
    taskUUID,
    taskToken,
    region,
}) {
    const previewer = useRef<SlidePreviewer | null>(null);
    const DynamicPreviewRef = useRef<HTMLDivElement>(null);
    const sp = useSafePromise();

    useEffect(() => {
        async function getDynamicResource(): Promise<void> {
            const convertState = await sp(
                queryConvertingTaskStatus({
                    taskUUID,
                    taskToken,
                    dynamic: true,
                    region,
                }),
            );

            if (DynamicPreviewRef.current) {
                previewer.current = previewSlide({
                    container: DynamicPreviewRef.current,
                    taskId: convertState.uuid,
                    url: extractSlideUrlPrefix(
                        convertState.progress?.convertedFileList[0].conversionFileUrl,
                    ),
                });
            }
        }

        getDynamicResource().catch(console.warn);

        return () => {
            if (previewer.current) {
                previewer.current.destroy();
                previewer.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className="dynamic-preview-container" ref={DynamicPreviewRef}></div>;
});

function extractSlideUrlPrefix(fullUrl?: string): string | undefined {
    if (!fullUrl || !fullUrl.startsWith("ppt")) {
        return undefined;
    }

    // e.g. "ppt(x)://cdn/prefix/dynamicConvert/{taskId}/1.slide"
    const pptSrcRE = /^pptx?(?<prefix>:\/\/\S+?dynamicConvert)\/(?<taskId>\w+)\//;

    const match = pptSrcRE.exec(fullUrl);
    if (!match || !match.groups) {
        return undefined;
    }

    return "https" + match.groups.prefix;
}
