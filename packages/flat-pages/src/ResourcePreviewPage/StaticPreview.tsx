import "./StaticPreview.less";

import { observer } from "mobx-react-lite";
import { Region } from "flat-components";
import React, { useEffect, useState } from "react";
import { queryConvertingTaskStatus } from "@netless/flat-stores";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { ConvertingTaskStatus } from "@netless/flat-server-api";

export interface StaticPreviewProps {
    taskUUID: string;
    taskToken: string;
    region: Region;
    projector: boolean;
}

type ConvertedFileList =
    | Array<{
          width: number;
          height: number;
          conversionFileUrl: string;
          preview?: string | undefined;
      }>
    | undefined;

const mapImagesToConvertedFileList = (convert: ConvertingTaskStatus): ConvertedFileList => {
    const images = convert.images || {};
    const previews = convert.previews || {};
    const result: NonNullable<ConvertedFileList> = [];
    for (const page in images) {
        const { width, height, url } = images[page];
        result.push({ width, height, conversionFileUrl: url, preview: previews[page] });
    }
    return result;
};

export const StaticPreview = observer<StaticPreviewProps>(function DocumentPreview({
    taskUUID,
    taskToken,
    region,
    projector,
}) {
    const [convertList, setConvertList] = useState<ConvertedFileList>([]);
    const sp = useSafePromise();

    useEffect(() => {
        async function getStaticResource(): Promise<void> {
            const convertResult = await sp(
                queryConvertingTaskStatus({
                    taskUUID,
                    taskToken,
                    dynamic: false,
                    region,
                    projector,
                }),
            );

            if (convertResult.images) {
                setConvertList(mapImagesToConvertedFileList(convertResult));
            } else if (convertResult.progress) {
                setConvertList(convertResult.progress.convertedFileList);
            }
        }

        getStaticResource().catch(console.warn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="static-preview-container">
            <div className="static-preview-list">
                {convertList?.map(file => {
                    return (
                        <img
                            key={file.conversionFileUrl}
                            className="static-preview-item"
                            src={file.conversionFileUrl}
                        ></img>
                    );
                })}
            </div>
        </div>
    );
});
