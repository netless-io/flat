import { FormInstance } from "antd/lib/form";
import { addDays, endOfDay, format, getDay, isBefore } from "date-fns";
import { zhCN } from "date-fns/locale";
import { PeriodicEndType } from "../../constants/Periodic";
import { EditRoomFormValues } from "./typings";

export function formatISODayWeekiii(date: Date): string {
    // TODO: i18n
    return format(date, "yyyy/MM/dd iii", { locale: zhCN });
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
        let times = 0;
        let t = beginTime;

        while (times < 50 - 1) {
            if (periodic.weeks.includes(getDay(t))) {
                if (++times >= periodic.rate) {
                    break;
                }
            }
            t = addDays(t, 1);
        }

        newPeriodic.endTime = endOfDay(t);
    } else {
        if (isBefore(newPeriodic.endTime, beginTime)) {
            newPeriodic.endTime = endOfDay(beginTime);
        }

        let times = 0;
        let t = beginTime;

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
