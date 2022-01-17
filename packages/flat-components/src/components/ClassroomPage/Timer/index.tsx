import React, { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./style.less";
import { useIsUnMounted } from "../../../utils/hooks";
import { RoomStatus } from "../../../types/room";
import { intervalToDuration } from "date-fns/fp";

export type TimerProps = {
    roomStatus: RoomStatus;
    beginTime: number;
};

export type TimerDuration = Required<Duration>;

const paddingZero = (number: number): string => {
    return String(number).padStart(2, "0");
};

const renderTime = ({ hours, minutes, seconds }: TimerDuration): string => {
    return hours > 0
        ? `${paddingZero(hours)}:${paddingZero(minutes)}:${paddingZero(seconds)}`
        : `${paddingZero(minutes)}:${paddingZero(seconds)}`;
};

const useClockTick = (beginTime: number, delay: number, roomStatus: RoomStatus): TimerDuration => {
    const [timestamp, updateTimestamp] = useState<number>(Date.now());

    const updateTime = (state: RoomStatus): void => {
        if (state === RoomStatus.Started) {
            updateTimestamp(Date.now());
        }
    };

    const unmounted = useIsUnMounted();

    const timer = useRef<number | null>(null);

    const state = useRef<typeof roomStatus>(roomStatus);

    useEffect(() => {
        state.current = roomStatus;
    });

    const startTimer = useCallback((): void => {
        if (unmounted.current === false) {
            updateTime(state.current);
            timer.current = window.setTimeout(startTimer, delay);
        }
    }, [timer, unmounted, state]);

    const stopTimer = useCallback((): void => {
        timer.current && window.clearTimeout(timer.current);
    }, [timer]);

    useEffect(() => {
        startTimer();
        return stopTimer;
    }, []);

    return intervalToDuration({ start: beginTime, end: timestamp }) as TimerDuration;
};

export const Timer: React.FC<TimerProps> = ({ roomStatus = RoomStatus.Paused, beginTime }) => {
    const timeDuration = useClockTick(beginTime, 100, roomStatus);

    const { t } = useTranslation();

    return (
        <span className="timer-bar">
            <span className={`timer-${roomStatus}`}>{t("room-started")}</span>
            <span>{renderTime(timeDuration)}</span>
        </span>
    );
};
