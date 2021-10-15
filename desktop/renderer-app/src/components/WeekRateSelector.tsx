import { Select } from "antd";
import { addDays, format, startOfWeek } from "date-fns";
import React, { FC } from "react";
import { zhCN } from "date-fns/locale";
import { Week } from "../api-middleware/flatServer/constants";
import { SelectProps } from "antd/lib/select";

export type WeekRateSelectorProps = SelectProps<Week[]>;

export const WeekRateSelector: FC<WeekRateSelectorProps> = props => {
    return (
        <Select mode="multiple" allowClear {...props}>
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
                    <Select.Option key={week} value={week} label={weekName}>
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
