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
import { Week } from "../../apiMiddleware/flatServer/constants";
import { PeriodicEndType } from "../../constants/Periodic";
import { ModifyPeriodicFormValues } from "./typings";

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

/** make sure periodic end time is not earlier than end time */
export function syncPeriodicEndAmount(
    form: FormInstance<ModifyPeriodicFormValues>,
    beginTime: ModifyPeriodicFormValues["beginTime"],
    endTime: ModifyPeriodicFormValues["endTime"],
    periodic: ModifyPeriodicFormValues["periodic"],
): void {
    const finalBeginTime = getFinalDate(beginTime);
    const finalEndTime = getFinalDate(endTime);

    const newPeriodic = { ...periodic };

    const day = getDay(finalBeginTime);

    if (!periodic.weeks.includes(day)) {
        newPeriodic.weeks = [...periodic.weeks, day].sort();
    }

    if (periodic.endType === PeriodicEndType.Rate) {
        if (periodic.rate) {
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
        }
    } else {
        if (isBefore(newPeriodic.endTime, finalBeginTime)) {
            newPeriodic.endTime = endOfDay(finalBeginTime);
        }

        let times = 0;
        let t = finalBeginTime;

        while (isBefore(t, newPeriodic.endTime)) {
            if (periodic.weeks.includes(getDay(t))) {
                times++;
            }
            t = addDays(t, 1);
        }

        newPeriodic.rate = times;
    }

    form.setFieldsValue({ periodic: newPeriodic });

    form.validateFields();
}

export function timeToRate(begin: Date, end: Date, weeks: Week[]): number {
    let sum = 0;
    for (let t = begin; isBefore(t, end); t = addDays(t, 1)) {
        if (weeks.includes(getDay(t))) {
            sum++;
        }
    }
    return sum;
}
