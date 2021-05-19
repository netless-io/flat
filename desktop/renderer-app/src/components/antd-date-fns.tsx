// https://ant.design/docs/react/replace-moment

import React, { FC, useContext } from "react";
import { Col, Row } from "antd";
import dateFnsGenerateConfig from "rc-picker/lib/generate/dateFns";
import generatePicker, { PickerTimeProps, PickerProps } from "antd/es/date-picker/generatePicker";
import { ConfigContext } from "antd/lib/config-provider";
import "antd/es/date-picker/style/index";

export type DatePickerProps = PickerProps<Date>;

const DatePickerInner = generatePicker<Date>(dateFnsGenerateConfig);

export const DatePicker: FC<DatePickerProps> = props => {
    // For some reason DatePickerInner does not receive configs from ConfigContext.
    // Pass them to DatePickerInner manually.
    const { getPopupContainer: getContextPopupContainer, locale: localeContext } =
        useContext(ConfigContext);

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

export interface FullTimePickerProps {
    value?: Date;
    disabledDate?: (date: Date) => boolean;
    disabledHours?: () => number[];
    disabledMinutes?: (selectedHour: number) => number[];
    onChange?: (date: Date) => void;
}

export const FullTimePicker: FC<FullTimePickerProps> = ({
    value,
    disabledDate,
    disabledHours,
    disabledMinutes,
    onChange,
}) => {
    return (
        <Row gutter={16}>
            <Col span={12}>
                <DatePicker
                    value={value}
                    allowClear={false}
                    disabledDate={disabledDate}
                    onChange={date => {
                        if (onChange && date) {
                            const result = new Date(date);
                            result.setSeconds(0);
                            result.setMilliseconds(0);
                            if (value) {
                                result.setHours(value.getHours());
                                result.setMinutes(value.getMinutes());
                            }
                            onChange(result);
                        }
                    }}
                />
            </Col>
            <Col span={12}>
                <TimePicker
                    value={value}
                    format="HH:mm"
                    allowClear={false}
                    disabledHours={disabledHours}
                    disabledMinutes={disabledMinutes}
                    onChange={date => {
                        if (onChange && date) {
                            const result = new Date(date);
                            result.setSeconds(0);
                            result.setMilliseconds(0);
                            if (value) {
                                result.setFullYear(value.getFullYear());
                                result.setMonth(value.getMonth());
                                result.setDate(value.getDate());
                            }
                            onChange(result);
                        }
                    }}
                />
            </Col>
        </Row>
    );
};
