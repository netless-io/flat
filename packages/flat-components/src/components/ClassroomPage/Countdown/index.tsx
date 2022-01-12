import React, { useRef, useState, useEffect, useCallback } from "react";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import "./style.less";

export type CountdownProps = {
    state: "paused" | "started";
    beginTime: number;
};

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

const useMounted = (): React.MutableRefObject<boolean> => {
    const mounted = useRef<boolean>(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    return mounted;
};

const timeElapsedInMs = (n: number): number => {
    return Math.floor((Date.now() - n) / 1000);
};

const useClockTick = (beginTime: number, delay: number, cbArgs: any): number => {
    const [timestamp, updateTimestamp] = useState<number>(timeElapsedInMs(beginTime));

    const updateTime = (state: string): void => {
        if (state !== "paused") {
            updateTimestamp(timeElapsedInMs(beginTime));
        }
    };

    const mounted = useMounted();

    const timer = useRef<number | null>(null);

    const args = useRef<typeof cbArgs | null>(cbArgs);

    useEffect(() => {
        args.current = cbArgs;
    });

    const startTimer = useCallback((): void => {
        if (mounted.current) {
            updateTime(args.current);
            timer.current = window.setTimeout(startTimer, delay);
        }
    }, [timer, mounted, args]);

    const stopTimer = useCallback((): void => {
        timer.current && window.clearTimeout(timer.current);
    }, [timer]);

    useEffect(() => {
        startTimer();
        return stopTimer;
    }, [mounted]);

    return timestamp;
};

export const Countdown: React.FC<CountdownProps> = ({ state = "paused", beginTime }) => {
    const timestamp = useClockTick(beginTime, 100, state);

    const stateCls = classnames(`countdown-${state}`);

    const { t } = useTranslation();

    return (
        <span className="countdown-bar">
            <span className={stateCls}>{t("room-started")}</span>
            <span>{renderTime(timestamp)}</span>
        </span>
    );
};
