import { FormInstance } from "antd/lib/form";
import { addDays, endOfDay, format, getDay, isBefore } from "date-fns";
import { zhCN } from "date-fns/locale";
import { PeriodicEndType } from "../../constants/Periodic";
import { EditRoomFormValues } from "./typings";

export function formatISODayWeekiii(date: Date): string {
    // TODO: i18n
    return format(date, "yyyy/MM/dd iii", { locale: zhCN });
}

export function getEndTimeFromRate(beginTime: Date, weeks: number[], rate: number): Date {
    let times = 0;
    let t = beginTime;

    while (times < 50 - 1) {
        if (weeks.includes(getDay(t))) {
            if (++times >= rate) {
                break;
            }
        }
        t = addDays(t, 1);
    }

    return endOfDay(t);
}

export function getRateFromEndTime(
    beginTime: Date,
    weeks: number[],
    periodicEndTime: Date,
): { endTime: Date; rate: number } {
    if (isBefore(periodicEndTime, beginTime)) {
        periodicEndTime = endOfDay(beginTime);
    }

    let times = 0;
    let t = beginTime;

    while (isBefore(t, periodicEndTime)) {
        if (weeks.includes(getDay(t))) {
            times++;
        }
        t = addDays(t, 1);
    }

    return { endTime: periodicEndTime, rate: times };
}

/**
 * In rate endType mode: make sure periodic end time is enough for all classes.
 * In time endType mode: recalculate classroom rate.
 */
export function syncPeriodicEndAmount(
    form: FormInstance<EditRoomFormValues>,
    beginTime: EditRoomFormValues["beginTime"],
    periodic: EditRoomFormValues["periodic"],
): void {
    const isPeriodic: EditRoomFormValues["isPeriodic"] = form.getFieldValue("isPeriodic");
    if (!isPeriodic) {
        return;
    }

    const newPeriodic = { ...periodic };

    const day = getDay(beginTime);

    if (!periodic.weeks.includes(day)) {
        newPeriodic.weeks = [...periodic.weeks, day].sort();
    }

    if (periodic.endType === PeriodicEndType.Rate) {
        newPeriodic.endTime = getEndTimeFromRate(beginTime, newPeriodic.weeks, newPeriodic.rate);
    } else {
        const { endTime, rate } = getRateFromEndTime(
            beginTime,
            newPeriodic.weeks,
            newPeriodic.endTime,
        );
        newPeriodic.endTime = endTime;
        newPeriodic.rate = rate;
    }

    form.setFieldsValue({ periodic: newPeriodic });

    form.validateFields();
}
