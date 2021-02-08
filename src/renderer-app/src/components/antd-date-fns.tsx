// https://ant.design/docs/react/replace-moment

import React, { FC, useContext } from "react";
import dateFnsGenerateConfig from "rc-picker/lib/generate/dateFns";
import generatePicker, { PickerTimeProps, PickerProps } from "antd/es/date-picker/generatePicker";
import { ConfigContext } from "antd/lib/config-provider";
import "antd/es/date-picker/style/index";

export type DatePickerProps = PickerProps<Date>;

const DatePickerInner = generatePicker<Date>(dateFnsGenerateConfig);

export const DatePicker: FC<DatePickerProps> = props => {
    // For some reason DatePickerInner does not receive configs from ConfigContext.
    // Pass them to DatePickerInner manually.
    const { getPopupContainer: getContextPopupContainer, locale: localeContext } = useContext(
        ConfigContext,
    );

    return (
        <DatePickerInner
            {...props}
            locale={props.locale || localeContext?.DatePicker}
            getPopupContainer={props.getPopupContainer || getContextPopupContainer}
        />
    );
};

export type TimePickerProps = Omit<PickerTimeProps<Date>, "picker">;

export const TimePicker: FC<TimePickerProps> = props => {
    return <DatePicker {...props} picker="time" mode={undefined} />;
};

TimePicker.displayName = "TimePicker";
