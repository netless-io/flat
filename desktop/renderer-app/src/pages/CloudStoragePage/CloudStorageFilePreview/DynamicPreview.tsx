import "./DynamicPreview.less";
import previousStepSVG from "./image/previous-step.svg";
import nextStepSVG from "./image/next-step.svg";

import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { queryConvertingTaskStatus } from "../../../apiMiddleware/courseware-converting";
import { ConversionResponse, previewPPT } from "white-web-sdk";
import { EventEmitter } from "eventemitter3";
import classNames from "classnames";
import { Region } from "flat-components";

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
    const DynamicPreviewRef = useRef<HTMLDivElement>(null);
    const sp = useSafePromise();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [eventEmit] = useState(() => new EventEmitter());

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPage;

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
                previewPPT(
                    convertState as ConversionResponse,
                    DynamicPreviewRef.current,
                    {},
                    true,
                    {},
                    undefined,
                    undefined,
                    eventEmit,
                );
            }
        }

        getDynamicResource().catch(console.warn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        eventEmit.on("update", data => {
            setCurrentPage(data.index);
        });
        eventEmit.once("update", data => {
            setTotalPage(data.total);
        });
        return () => {
            eventEmit.removeAllListeners();
        };
    }, [eventEmit]);

    return (
        <div className="dynamic-preview-container">
            <div
                ref={DynamicPreviewRef}
                className="dynamic-preview-inner"
                style={{ width: "960px", height: "538px" }}
            />
            <div className="dynamic-preview-pagination-container">
                <div
                    className={classNames("dynamic-preview-pagination-previous", {
                        "dynamic-preview-pagination-not-allow": isFirstPage,
                    })}
                    onClick={() => {
                        eventEmit.emit("preStep");
                    }}
                >
                    <img src={previousStepSVG} alt="previous step" />
                </div>
                <div className="dynamic-preview-pagination-middle">
                    {currentPage} / {totalPage}
                </div>
                <div
                    className={classNames("dynamic-preview-pagination-previous", {
                        "dynamic-preview-pagination-not-allow": isLastPage,
                    })}
                    onClick={() => {
                        eventEmit.emit("nextStep");
                    }}
                >
                    <img src={nextStepSVG} alt="next step" />
                </div>
            </div>
        </div>
    );
});
