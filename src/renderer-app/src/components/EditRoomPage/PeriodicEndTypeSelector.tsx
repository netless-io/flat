import { Select } from "antd";
import { SelectProps } from "antd/lib/select";
import React, { FC } from "react";
import { PeriodicEndType } from "../../constants/Periodic";
import { getPeriodicEndTypeName } from "../../utils/getTypeName";

export type PeriodicEndTypeSelectorProps = SelectProps<PeriodicEndType>;

export const PeriodicEndTypeSelector: FC<PeriodicEndTypeSelectorProps> = props => {
    return (
        <Select {...props}>
            {[PeriodicEndType.Rate, PeriodicEndType.Time].map(type => {
                const periodicEndTypeName = getPeriodicEndTypeName(type);
                return (
                    <Select.Option key={type} value={type} label={periodicEndTypeName}>
                        {periodicEndTypeName}
                    </Select.Option>
                );
            })}
        </Select>
    );
};

export default PeriodicEndTypeSelector;
