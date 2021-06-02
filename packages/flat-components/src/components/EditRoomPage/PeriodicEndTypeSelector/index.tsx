import { Select } from "antd";
import { SelectProps } from "antd/lib/select";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { PeriodicEndType } from "../../../types/room";

export type PeriodicEndTypeSelectorProps = SelectProps<PeriodicEndType>;

export const PeriodicEndTypeSelector: FC<PeriodicEndTypeSelectorProps> = props => {
    const { t } = useTranslation();
    return (
        <Select {...props}>
            {["rate", "time"].map(type => {
                const periodicEndTypeName = t(`end-repeat-type.${type as PeriodicEndType}`);
                return (
                    <Select.Option key={type} value={type} label={periodicEndTypeName}>
                        {periodicEndTypeName}
                    </Select.Option>
                );
            })}
        </Select>
    );
};
