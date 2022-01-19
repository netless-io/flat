import React from "react";
import { Radio } from "antd";
import { useTranslation } from "react-i18next";
import bigClassSVG from "./icons/big-class.svg";
import oneToOneSVG from "./icons/one-to-one.svg";
import smallClassSVG from "./icons/small-class.svg";

export type ClassPickerItemType = "OneToOne" | "BigClass" | "SmallClass";

interface ClassPickerItemProps {
    value: ClassPickerItemType;
    large?: boolean;
}

const ClassPickerIcons: Record<ClassPickerItemType, string> = {
    BigClass: bigClassSVG,
    OneToOne: oneToOneSVG,
    SmallClass: smallClassSVG,
};

export const ClassPickerItem: React.FC<ClassPickerItemProps> = ({ value, large }) => {
    const { t } = useTranslation();

    return (
        <Radio value={value}>
            {large ? (
                <div className="class-large-picker-item-container">
                    <img className="class-large-picker-item-icon" src={ClassPickerIcons[value]} />
                    <div className="class-large-picker-item-right">
                        <span className="class-large-picker-item-title">
                            {t(`class-room-type.${value}`)}
                        </span>
                        <span className="class-large-picker-item-content">
                            {t(`class-picker-text.${value}`)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="class-picker-item-container">
                    <img className="class-picker-item-icon" src={ClassPickerIcons[value]} />
                    <span className="class-picker-item-title">{t(`class-room-type.${value}`)}</span>
                    <span className="class-picker-item-content">
                        {t(`class-picker-text.${value}`)}
                    </span>
                </div>
            )}
        </Radio>
    );
};
