import React, { FC } from "react";
import { Select } from "antd";
import { SelectProps } from "antd/lib/select";
import { addDays, format, startOfWeek } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Week } from "../api-middleware/flatServer/constants";

export type WeekRateSelectorProps = SelectProps<Week[]>;

export const WeekRateSelector: FC<WeekRateSelectorProps> = props => {
    return (
        <Select allowClear mode="multiple" {...props}>
            {[
                Week.Sunday,
                Week.Monday,
                Week.Tuesday,
                Week.Wednesday,
                Week.Thursday,
                Week.Friday,
                Week.Saturday,
            ].map(week => {
                const weekName = getWeekName(week);
                return (
                    <Select.Option key={week} label={weekName} value={week}>
                        {weekName}
                    </Select.Option>
                );
            })}
        </Select>
    );
};

export default WeekRateSelector;

export function getWeekName(week: Week): string {
    const t = addDays(startOfWeek(new Date()), week);
    return format(t, "iii", { locale: zhCN });
}

export function getWeekNames(weeks: Week[]): string {
    return weeks.map(getWeekName).join("、");
}
