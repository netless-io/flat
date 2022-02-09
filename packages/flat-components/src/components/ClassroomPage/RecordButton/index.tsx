import "./style.less";
import recordingStartSVG from "./icons/recording-start.svg";
import recordingStopSVG from "./icons/recording-stop.svg";

import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { TopBarRoundBtn } from "../";
import { useTranslation } from "react-i18next";

export interface RecordButtonProps {
    isRecording: boolean;
    onClick: () => void;
}

function renderTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);
    return (
        (h > 0 ? String(h).padStart(2, "0") + ":" : "") +
        String(m).padStart(2, "0") +
        ":" +
        String(s).padStart(2, "0")
    );
}

export const RecordButton: FC<RecordButtonProps> = ({ isRecording, onClick }) => {
    const countTimeout = useRef(NaN);
    const startTime = useRef(0);
    const [count, setCount] = useState("");

    const { t } = useTranslation();

    const countUp = useCallback(() => {
        setCount(renderTime(Math.floor((Date.now() - startTime.current) / 1000)));
        countTimeout.current = window.setTimeout(countUp, 100);
    }, []);

    const stopCount = useCallback(() => {
        if (!Number.isNaN(countTimeout.current)) {
            window.clearTimeout(countTimeout.current);
            countTimeout.current = NaN;
        }
    }, []);

    useEffect(() => {
        if (isRecording) {
            startTime.current = Date.now();
            countUp();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isRecording) {
            startTime.current = Date.now();
            stopCount();
            countUp();
        } else {
            stopCount();
            setCount("");
        }

        return stopCount;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording]);

    return (
        <div className="record-button-container">
            <TopBarRoundBtn
                icon={<img src={isRecording ? recordingStopSVG : recordingStartSVG} />}
                onClick={onClick}
            >
                {isRecording ? (
                    <span className="recording-text-stop">{t("stop-recording")}</span>
                ) : (
                    <span className="recording-text-start">{t("start-recording")}</span>
                )}
                <span className="recording-time-count">{count}</span>
            </TopBarRoundBtn>
        </div>
    );
};
