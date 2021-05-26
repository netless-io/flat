import bigClassSVG from "./icons/big-class.svg";
import oneToOneSVG from "./icons/one-to-one.svg";
import smallClassSVG from "./icons/small-class.svg";

import "./index.less";

import React from "react";
import { Radio } from "antd";
import classNames from "classnames";

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

const ClassPickerTitles: Record<ClassPickerItemType, string> = {
    bigClass: "大班课",
    oneToOne: "一对一",
    smallClass: "小班课",
};

const ClassPickerTexts: Record<ClassPickerItemType, string> = {
    bigClass: "适用于 1 位老师面向大量学生",
    oneToOne: "适用于 1 位老师与 1 名学生",
    smallClass: "适用于 1 位老师面向最多 16 名学生",
};

export const ClassPickerItem: React.FC<Pick<ClassPickerProps, "type" | "large">> = ({
    type,
    large,
}) => {
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
                            {ClassPickerTitles[type]}
                        </span>
                        <span className="class-large-picker-item-content">
                            {ClassPickerTexts[type]}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="class-picker-item-container">
                    <img className="class-picker-item-icon" src={ClassPickerIcons[type]}></img>
                    <span className="class-picker-item-title">{ClassPickerTitles[type]}</span>
                    <span className="class-picker-item-content">{ClassPickerTexts[type]}</span>
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
