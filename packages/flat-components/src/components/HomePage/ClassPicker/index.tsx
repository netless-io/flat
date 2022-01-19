import React from "react";
import { Radio } from "antd";
import classNames from "classnames";
import { ClassPickerItem, ClassPickerItemType } from "./ClassPickerItem";
import "./index.less";

export type { ClassPickerItemType } from "./ClassPickerItem";

export interface ClassPickerProps {
    value?: ClassPickerItemType;
    large?: boolean;
    disabled?: boolean;
    onChange?: (value: ClassPickerItemType) => void;
}

export const ClassPicker: React.FC<ClassPickerProps> = ({ value, onChange, large, disabled }) => {
    return (
        <Radio.Group
            className={classNames("class-picker-container", {
                "class-large-picker-container": large,
            })}
            disabled={disabled}
            value={value}
            onChange={e => onChange && e.target.value && onChange(e.target.value)}
        >
            <ClassPickerItem large={large} value="BigClass" />
            <ClassPickerItem large={large} value="SmallClass" />
            <ClassPickerItem large={large} value="OneToOne" />
        </Radio.Group>
    );
};
