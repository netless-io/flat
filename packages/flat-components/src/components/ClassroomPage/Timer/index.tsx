import "./style.less";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useIsUnMounted } from "../../../utils/hooks";
import { RoomStatus } from "../../../types/room";
import { intervalToDuration } from "date-fns/fp";

export type TimerProps = {
    roomStatus: RoomStatus;
    beginTime: number;
};

const paddingHexCode = (number: number): string => {
    return String(number).padStart(2, "0");
};

const useClockTick = (beginTime: number, roomStatus: RoomStatus): string => {
    const [timestamp, updateTimestamp] = useState<number>(Date.now());
    const unmounted = useIsUnMounted();

    useEffect(() => {
        let timer = NaN;

        if (unmounted.current) {
            return;
        }

        if (roomStatus === RoomStatus.Started) {
            const startTimer = (): void => {
                updateTimestamp(Math.floor(Date.now() / 1000) * 1000);
                timer = window.requestAnimationFrame(startTimer);
            };
            startTimer();
        }

        return () => {
            window.cancelAnimationFrame(timer);
        };
    }, [roomStatus, unmounted]);

    return useMemo(() => {
        const {
            days = 0,
            hours = 0,
            minutes = 0,
            seconds = 0,
        } = intervalToDuration({
            start: beginTime,
            end: timestamp,
        });

        const minutesAndSeconds = `${paddingHexCode(minutes)}:${paddingHexCode(seconds)}`;
        const dayHours = hours + days * 24;

        return dayHours > 0
            ? `${paddingHexCode(dayHours)}:${minutesAndSeconds}`
            : minutesAndSeconds;
    }, [beginTime, timestamp]);
};

export const Timer: React.FC<TimerProps> = ({ roomStatus = RoomStatus.Paused, beginTime }) => {
    const timing = useClockTick(beginTime, roomStatus);

    const { t } = useTranslation();

    return (
        <span className="timer-bar">
            <span className={`timer-${roomStatus}`}>{t("room-started")}</span>
            <span className="timer-text">{timing}</span>
        </span>
    );
};
