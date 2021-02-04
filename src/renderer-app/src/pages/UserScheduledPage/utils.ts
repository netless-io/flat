import { FormInstance } from "antd/lib/form";
import {
    addDays,
    addMilliseconds,
    differenceInMilliseconds,
    endOfDay,
    format,
    getDay,
    isBefore,
    subDays,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { PeriodicEndType } from "../../constants/Periodic";
import { CreatePeriodicFormValues } from "./typings";

/** Minimum class duration in minutes */
export const MIN_DURATION = 15;

export function formatISODayWeekiii(date: Date): string {
    // TODO: i18n
    return format(date, "yyyy/MM/dd iii", { locale: zhCN });
}

export function getFinalDate({ date, time }: { date: Date; time: Date }): Date {
    const result = new Date(date);
    result.setSeconds(time.getSeconds());
    result.setMinutes(time.getMinutes());
    result.setHours(time.getHours());
    return result;
}

/**
 * In rate endType mode: make sure periodic end time is enough for all classes.
 * In time endType mode: recalculate classroom rate.
 */
export function syncPeriodicEndAmount(
    form: FormInstance<CreatePeriodicFormValues>,
    beginTime: CreatePeriodicFormValues["beginTime"],
    endTime: CreatePeriodicFormValues["endTime"],
    periodic: CreatePeriodicFormValues["periodic"],
): void {
    const finalBeginTime = getFinalDate(beginTime);
    const finalEndTime = getFinalDate(endTime);

    const newPeriodic = { ...periodic };

    const day = getDay(finalBeginTime);

    if (!periodic.weeks.includes(day)) {
        newPeriodic.weeks = [...periodic.weeks, day].sort();
    }

    if (periodic.endType === PeriodicEndType.Rate) {
        let times = 0;
        let t = finalBeginTime;

        while (times < periodic.rate) {
            if (periodic.weeks.includes(getDay(t))) {
                times++;
            }
            t = addDays(t, 1);
        }

        t = subDays(t, 1);

        newPeriodic.endTime = endOfDay(
            addMilliseconds(t, differenceInMilliseconds(finalEndTime, finalBeginTime)),
        );
    } else {
        if (isBefore(newPeriodic.endTime, finalEndTime)) {
            newPeriodic.endTime = new Date(finalEndTime);
        }

        let times = 0;
        let t = finalEndTime;

        while (isBefore(t, newPeriodic.endTime)) {
            if (periodic.weeks.includes(getDay(t))) {
                times++;
            }
            t = addDays(t, 1);
        }

        newPeriodic.rate = times;
    }

    form.setFieldsValue({ periodic: newPeriodic });
}
