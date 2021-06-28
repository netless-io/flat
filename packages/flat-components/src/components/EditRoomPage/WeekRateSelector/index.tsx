import { Select } from "antd";
import React, { FC } from "react";
import { SelectProps } from "antd/lib/select";
import { Week } from "../../../types/room";
import { getWeekName } from "../../../utils/room";

export type WeekRateSelectorProps = SelectProps<Week[]> & { lang: string };

export const WeekRateSelector: FC<WeekRateSelectorProps> = ({ lang, ...props }) => {
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
                const weekName = getWeekName(week, lang);
                return (
                    <Select.Option key={week} value={week} label={weekName}>
                        {weekName}
                    </Select.Option>
                );
            })}
        </Select>
    );
};
