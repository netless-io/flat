import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./style.less";
import { useIsUnMounted } from "../../../utils/hooks";
import { RoomStatus } from "../../../types/room";
import { intervalToDuration } from "date-fns/fp";
import type { Duration } from "date-fns";

export type TimerProps = {
    roomStatus: RoomStatus;
    beginTime: number;
};

// see: https://github.com/date-fns/date-fns/issues/2891#issuecomment-1003070337
export type TimerDuration = Omit<Required<Duration>, "weeks">;

const paddingZero = (number: number): string => {
    return String(number).padStart(2, "0");
};

const useTiming = (duration: TimerDuration): string => {
    return useMemo(() => {
        const { hours, minutes, seconds } = duration;
        const minutesAndSeconds = `${paddingZero(minutes)}:${paddingZero(seconds)}`;
        return hours > 0 ? `${paddingZero(hours)}:${minutesAndSeconds}` : minutesAndSeconds;
    }, [duration]);
};

const useClockTick = (beginTime: number, roomStatus: RoomStatus): TimerDuration => {
    const [timestamp, updateTimestamp] = useState<number>(Date.now());
    const unmounted = useIsUnMounted();

    useEffect(() => {
        if (unmounted.current) {
            return;
        }
        if (roomStatus === RoomStatus.Started) {
            updateTimestamp(Date.now());
        }
    }, [roomStatus, timestamp, unmounted]);

    return useMemo(
        () => intervalToDuration({ start: beginTime, end: timestamp }) as TimerDuration,
        [beginTime, timestamp],
    );
};

export const Timer: React.FC<TimerProps> = ({ roomStatus = RoomStatus.Paused, beginTime }) => {
    const timeDuration = useClockTick(beginTime, roomStatus);

    const { t } = useTranslation();

    const timing = useTiming(timeDuration);

    return (
        <span className="timer-bar">
            <span className={`timer-${roomStatus}`}>{t("room-started")}</span>
            <span>{timing}</span>
        </span>
    );
};
