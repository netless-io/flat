import React from "react";
import { Form } from "antd";
import { FormInstance, RuleObject } from "antd/lib/form";
import { isBefore, addMinutes } from "date-fns";
import { CreatePeriodicFormValues } from "./typings";
import { compareDay, compareHour, MIN_CLASS_DURATION, range } from "../../utils/date";
import { FullTimePicker } from "../../components/antd-date-fns";

export function renderEndTimePicker(
    form: FormInstance<CreatePeriodicFormValues>,
): React.ReactElement {
    return (
        <Form.Item label="结束时间" name="endTime" rules={[validateTime]}>
            <FullTimePicker
                disabledDate={disabledDate}
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
            />
        </Form.Item>
    );

    function validateTime(): RuleObject {
        return {
            validator: async (_, value: Date) => {
                const beginTime: CreatePeriodicFormValues["beginTime"] = form.getFieldValue(
                    "beginTime",
                );
                const compareTime = addMinutes(beginTime, MIN_CLASS_DURATION);
                if (isBefore(value, compareTime)) {
                    throw new Error(`房间时长最少 ${MIN_CLASS_DURATION} 分钟`);
                }
            },
        };
    }

    function disabledDate(date: Date): boolean {
        const beginTime: CreatePeriodicFormValues["beginTime"] = form.getFieldValue("beginTime");
        return compareDay(addMinutes(beginTime, MIN_CLASS_DURATION), date) > 0;
    }

    function disabledHours(): number[] {
        const {
            beginTime,
            endTime,
        }: Pick<CreatePeriodicFormValues, "beginTime" | "endTime"> = form.getFieldsValue([
            "beginTime",
            "endTime",
        ]);

        const compareTime = addMinutes(beginTime, MIN_CLASS_DURATION);

        const diff = compareDay(compareTime, endTime);

        if (diff < 0) {
            return [];
        }

        if (diff === 0) {
            return range(compareTime.getHours());
        }

        return range(24);
    }

    function disabledMinutes(selectedHour: number): number[] {
        const {
            beginTime,
            endTime,
        }: Pick<CreatePeriodicFormValues, "beginTime" | "endTime"> = form.getFieldsValue([
            "beginTime",
            "endTime",
        ]);

        const compareTime = addMinutes(beginTime, MIN_CLASS_DURATION);
        compareTime.setHours(selectedHour);

        const diff = compareHour(endTime, compareTime);

        if (diff < 0) {
            return [];
        }

        if (diff === 0) {
            return range(endTime.getMinutes());
        }

        return range(60);
    }
}
