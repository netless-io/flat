import "./StaticPreview.less";

import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { queryConvertingTaskStatus } from "../../../api-middleware/courseware-converting";
import { Region } from "flat-components";

export interface StaticPreviewProps {
    taskUUID: string;
    taskToken: string;
    region: Region;
}

type ConvertedFileList =
    | Array<{
          width: number;
          height: number;
          conversionFileUrl: string;
          preview?: string | undefined;
      }>
    | undefined;

export const StaticPreview = observer<StaticPreviewProps>(function DocumentPreview({
    taskUUID,
    taskToken,
    region,
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
                }),
            );

            setConvertList(convertResult.progress?.convertedFileList);
        }
        getStaticResource().catch(console.warn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="static-preview-container">
            {convertList?.map(file => {
                return (
                    <img
                        className="static-preview-item"
                        src={file.conversionFileUrl}
                        key={file.conversionFileUrl}
                    />
                );
            })}
        </div>
    );
});
