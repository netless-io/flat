import "./style.less";

import React, { ReactElement } from "react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { TopBarRightBtn } from "../TopBar/TopBarRightBtn";

export interface RecordButtonProps {
    disabled: boolean;
    isRecording: boolean;
    icon?: ReactElement;
    iconActive?: ReactElement;
    onClick: () => void;
}

function renderTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);
    return (
        (h > 0 ? String(s).padStart(2, "0") + ":" : "") +
        String(m).padStart(2, "0") +
        ":" +
        String(s).padStart(2, "0")
    );
}

export const RecordButton: FC<RecordButtonProps> = ({
    disabled,
    isRecording,
    icon,
    iconActive,
    onClick,
}) => {
    const countTimeout = useRef(NaN);
    const prevIsRecording = useRef(isRecording);
    const startTime = useRef(0);
    const [count, setCount] = useState("");

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
            if (!prevIsRecording.current) {
                startTime.current = Date.now();
                stopCount();
                countUp();
            }
        } else {
            stopCount();
            setCount("");
        }

        prevIsRecording.current = isRecording;

        return stopCount;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording]);

    return (
        <div className="record-button">
            <TopBarRightBtn
                title="Record"
                icon={isRecording ? icon : iconActive}
                onClick={onClick}
                disabled={disabled}
            />
            {count}
        </div>
    );
};
