import React, { useRef, useState, useEffect, useCallback } from "react";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import "./style.less";
import { useIsUnMounted } from "../../../utils/hooks";
import { RoomStatus } from "../../../types/room";
import { intervalToDuration } from "date-fns/esm";

export type TimerProps = {
    roomStatus: RoomStatus;
    beginTime: number;
};

const paddingZero = (number?: number): string => {
    return String(number).padStart(2, "0");
};

const renderTime = ({ hours, minutes, seconds }: Duration): string => {
    return hours && hours > 0
        ? `${paddingZero(hours)}:${paddingZero(minutes)}:${paddingZero(seconds)}`
        : `${paddingZero(minutes)}:${paddingZero(seconds)}`;
};

const useClockTick = (beginTime: number, delay: number, cbArgs: any): Duration => {
    const [timestamp, updateTimestamp] = useState<number>(Date.now());

    const updateTime = (state: string): void => {
        if (state === RoomStatus.Started) {
            updateTimestamp(Date.now());
        }
    };

    const unmounted = useIsUnMounted();

    const timer = useRef<number | null>(null);

    const args = useRef<typeof cbArgs | null>(cbArgs);

    useEffect(() => {
        args.current = cbArgs;
    });

    const startTimer = useCallback((): void => {
        if (unmounted.current === false) {
            updateTime(args.current);
            timer.current = window.setTimeout(startTimer, delay);
        }
    }, [timer, unmounted, args]);

    const stopTimer = useCallback((): void => {
        timer.current && window.clearTimeout(timer.current);
    }, [timer]);

    useEffect(() => {
        startTimer();
        return stopTimer;
    }, []);

    return intervalToDuration({ start: beginTime, end: timestamp });
};

export const Timer: React.FC<TimerProps> = ({ roomStatus = RoomStatus.Paused, beginTime }) => {
    const timeDuration = useClockTick(beginTime, 100, roomStatus);

    const roomStatusCls = classnames(`timer-${roomStatus}`);

    const { t } = useTranslation();

    return (
        <span className="timer-bar">
            <span className={roomStatusCls}>{t("room-started")}</span>
            <span>{renderTime(timeDuration)}</span>
        </span>
    );
};
