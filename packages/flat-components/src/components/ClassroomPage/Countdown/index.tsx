import React, { useRef, useState, useEffect, useCallback } from "react";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import "./style.less";
import format from "date-fns/format";
import { useIsUnMounted } from "../../../utils/hooks";
import { RoomStatus } from "../../../types/room";

export type CountdownProps = {
    roomStatus: RoomStatus;
    beginTime: number;
};

const timeElapsedInMs = (n: number): number => {
    return Date.now() - n;
};

const useClockTick = (beginTime: number, delay: number, cbArgs: any): number => {
    const [timestamp, updateTimestamp] = useState<number>(timeElapsedInMs(beginTime));

    const updateTime = (state: string): void => {
        if (state === RoomStatus.Started) {
            updateTimestamp(timeElapsedInMs(beginTime));
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

    return timestamp;
};

export const Countdown: React.FC<CountdownProps> = ({
    roomStatus = RoomStatus.Paused,
    beginTime,
}) => {
    const timestamp = useClockTick(beginTime, 100, roomStatus);

    const roomStatusCls = classnames(`countdown-${roomStatus}`);

    const { t } = useTranslation();

    return (
        <span className="countdown-bar">
            <span className={roomStatusCls}>{t("room-started")}</span>
            <span>{format(timestamp, "mm:ss")}</span>
        </span>
    );
};
