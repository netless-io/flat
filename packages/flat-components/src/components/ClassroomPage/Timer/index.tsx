import "./style.less";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { useIsUnMounted } from "../../../utils/hooks";
import { RoomStatus } from "../../../types/room";
import { intervalToDuration } from "date-fns";

export type TimerProps = {
    roomStatus: RoomStatus;
    beginTime: number;
    // Will show 'left time' when expireAt is set in the last 5 minutes
    // 0 or undefined means no expire time
    expireAt?: number;
};

const enum TimerStatus {
    Prepare, // 0, show a count down time with normal color
    Started, // 1, show a count up time in success color
    WillEnd, // 2, show a count down time in warning color
    Ended, // 3, show a count up time in error color
}

const paddingHexCode = (number: number): string => {
    return String(number).padStart(2, "0");
};

const formatInterval = (start: number, end: number): string => {
    const { days = 0, hours = 0, minutes = 0, seconds = 0 } = intervalToDuration({ start, end });

    const minutesAndSeconds = `${paddingHexCode(minutes)}:${paddingHexCode(seconds)}`;
    const dayHours = hours + days * 24;

    return dayHours > 0 ? `${paddingHexCode(dayHours)}:${minutesAndSeconds}` : minutesAndSeconds;
};

const useClockTick = (beginTime: number, expireAt: number | undefined): [TimerStatus, string] => {
    const [timestamp, updateTimestamp] = useState<number>(Date.now());
    const unmounted = useIsUnMounted();

    useEffect(() => {
        let timer = 0;

        if (unmounted.current) {
            return;
        }

        const startTimer = (): void => {
            updateTimestamp(Math.floor(Date.now() / 1000) * 1000);
            timer = window.requestAnimationFrame(startTimer);
        };
        startTimer();

        return () => {
            window.cancelAnimationFrame(timer);
        };
    }, [unmounted]);

    return useMemo(() => {
        if (beginTime > timestamp) {
            return [TimerStatus.Prepare, formatInterval(timestamp, beginTime)];
        } else if (expireAt && 0 <= expireAt - timestamp && expireAt - timestamp < 5 * 60_000) {
            return [TimerStatus.WillEnd, formatInterval(timestamp, expireAt)];
        } else if (expireAt && expireAt < timestamp) {
            return [TimerStatus.Ended, formatInterval(expireAt, timestamp)];
        } else {
            return [TimerStatus.Started, formatInterval(beginTime, timestamp)];
        }
    }, [beginTime, timestamp, expireAt]);
};

export const Timer: React.FC<TimerProps> = ({ beginTime, expireAt }) => {
    const t = useTranslate();
    const [status, timing] = useClockTick(beginTime, expireAt);

    return (
        <span className={`timer-bar timer-bar-${status}`}>
            <span className={`timer-${status}`}>{t(`timer-status-${status}`)}</span>
            <span className="timer-text">{timing}</span>
        </span>
    );
};
