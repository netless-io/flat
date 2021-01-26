// https://ant.design/docs/react/replace-moment

import React from "react";
import dateFnsGenerateConfig from "rc-picker/lib/generate/dateFns";
import generatePicker, { PickerTimeProps } from "antd/es/date-picker/generatePicker";
import "antd/es/date-picker/style/index";

export const DatePicker = generatePicker<Date>(dateFnsGenerateConfig);

export interface TimePickerProps extends Omit<PickerTimeProps<Date>, "picker"> {}

export const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => {
    return <DatePicker {...props} picker="time" mode={undefined} ref={ref} />;
});

TimePicker.displayName = "TimePicker";
