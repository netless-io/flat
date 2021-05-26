import bigClassSVG from "./icons/big-class.svg";
import oneToOneSVG from "./icons/one-to-one.svg";
import smallClassSVG from "./icons/small-class.svg";

import "./index.less";

import React from "react";
import { Radio } from "antd";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

export type ClassPickerItemType = "oneToOne" | "bigClass" | "smallClass";

export interface ClassPickerProps {
    type: ClassPickerItemType;
    large?: boolean;
    onChange?: (value: ClassPickerItemType) => void;
}

const ClassPickerIcons: Record<ClassPickerItemType, string> = {
    bigClass: bigClassSVG,
    oneToOne: oneToOneSVG,
    smallClass: smallClassSVG,
};

export const ClassPickerItem: React.FC<Pick<ClassPickerProps, "type" | "large">> = ({
    type,
    large,
}) => {
    const { t } = useTranslation();
    return (
        <Radio value={type}>
            {large ? (
                <div className="class-large-picker-item-container">
                    <img
                        className="class-large-picker-item-icon"
                        src={ClassPickerIcons[type]}
                    ></img>
                    <div className="class-large-picker-item-right">
                        <span className="class-large-picker-item-title">
                            {t(`class-picker-title.${type}`)}
                        </span>
                        <span className="class-large-picker-item-content">
                            {t(`class-picker-text.${type}`)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="class-picker-item-container">
                    <img className="class-picker-item-icon" src={ClassPickerIcons[type]}></img>
                    <span className="class-picker-item-title">
                        {t(`class-picker-title.${type}`)}
                    </span>
                    <span className="class-picker-item-content">
                        {t(`class-picker-text.${type}`)}
                    </span>
                </div>
            )}
        </Radio>
    );
};

export const ClassPicker: React.FC<ClassPickerProps> = ({ type, onChange, large }) => {
    return (
        <Radio.Group
            className={classNames("class-picker-container", {
                "class-large-picker-container": large,
            })}
            value={type}
            onChange={e => onChange && e.target.value && onChange(e.target.value)}
        >
            <ClassPickerItem type="bigClass" large={large} />
            <ClassPickerItem type="smallClass" large={large} />
            <ClassPickerItem type="oneToOne" large={large} />
        </Radio.Group>
    );
};
