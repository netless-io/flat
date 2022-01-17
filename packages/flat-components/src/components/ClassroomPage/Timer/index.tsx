import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./style.less";
import { useIsUnMounted } from "../../../utils/hooks";
import { RoomStatus } from "../../../types/room";
import { intervalToDuration } from "date-fns/fp";

export type TimerProps = {
    roomStatus: RoomStatus;
    beginTime: number;
};

const paddingZero = (number: number): string => {
    return String(number).padStart(2, "0");
};

const useClockTick = (beginTime: number, roomStatus: RoomStatus): string => {
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

    return useMemo(() => {
        const {
            hours = 0,
            minutes = 0,
            seconds = 0,
        } = intervalToDuration({
            start: beginTime,
            end: timestamp,
        });
        const minutesAndSeconds = `${paddingZero(minutes)}:${paddingZero(seconds)}`;
        return hours > 0 ? `${paddingZero(hours)}:${minutesAndSeconds}` : minutesAndSeconds;
    }, [beginTime, timestamp]);
};

export const Timer: React.FC<TimerProps> = ({ roomStatus = RoomStatus.Paused, beginTime }) => {
    const timing = useClockTick(beginTime, roomStatus);

    const { t } = useTranslation();

    return (
        <span className="timer-bar">
            <span className={`timer-${roomStatus}`}>{t("room-started")}</span>
            <span>{timing}</span>
        </span>
    );
};
