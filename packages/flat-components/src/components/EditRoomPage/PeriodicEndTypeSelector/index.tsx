import { Select } from "antd";
import { SelectProps } from "antd/lib/select";
import React, { FC } from "react";
import { PeriodicEndType } from "../../../types/room";
import { getPeriodicEndTypeName } from "../../../utils/room";

export type PeriodicEndTypeSelectorProps = SelectProps<PeriodicEndType>;

export const PeriodicEndTypeSelector: FC<PeriodicEndTypeSelectorProps> = props => {
    return (
        <Select {...props}>
            {["rate", "time"].map(type => {
                const periodicEndTypeName = getPeriodicEndTypeName(type as PeriodicEndType);
                return (
                    <Select.Option key={type} value={type} label={periodicEndTypeName}>
                        {periodicEndTypeName}
                    </Select.Option>
                );
            })}
        </Select>
    );
};
