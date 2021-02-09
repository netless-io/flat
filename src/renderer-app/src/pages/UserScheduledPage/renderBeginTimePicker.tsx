import React from "react";
import { Form } from "antd";
import { FormInstance, RuleObject } from "antd/lib/form";
import { isBefore, addMinutes, setHours } from "date-fns";
import { CreatePeriodicFormValues } from "./typings";
import { syncPeriodicEndAmount } from "./utils";
import {
    compareDay,
    compareHour,
    compareMinute,
    getRoughNow,
    MIN_CLASS_DURATION,
    range,
} from "../../utils/date";
import { FullTimePicker } from "../../components/antd-date-fns";

export function renderBeginTimePicker(
    form: FormInstance<CreatePeriodicFormValues>,
): React.ReactElement {
    return (
        <Form.Item label="开始时间" name="beginTime" rules={[validateTime]}>
            <FullTimePicker
                disabledDate={disabledDate}
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
                onChange={onBeginTimeChanged}
            />
        </Form.Item>
    );

    function validateTime(): RuleObject {
        return {
            validator: async (_, value: Date) => {
                if (isBefore(value, getRoughNow())) {
                    throw new Error("开始时间不能为过去");
                }
            },
        };
    }

    function disabledDate(date: Date): boolean {
        return isBefore(date, getRoughNow());
    }

    function disabledHours(): number[] {
        const beginTime: CreatePeriodicFormValues["beginTime"] = form.getFieldValue("beginTime");
        const now = getRoughNow();

        const diff = compareDay(now, beginTime);

        if (diff < 0) {
            return [];
        }

        if (diff === 0) {
            return range(now.getHours());
        }

        return range(24);
    }

    function disabledMinutes(selectedHour: number): number[] {
        const beginTime: CreatePeriodicFormValues["beginTime"] = form.getFieldValue("beginTime");
        const now = getRoughNow();

        const diff = compareHour(now, setHours(beginTime, selectedHour));

        if (diff < 0) {
            return [];
        }

        if (diff === 0) {
            return range(now.getMinutes());
        }

        return range(60);
    }

    /** make sure end time is at least min duration after begin time */
    function onBeginTimeChanged(beginTime: Date): void {
        const {
            endTime,
            periodic,
        }: Pick<CreatePeriodicFormValues, "endTime" | "periodic"> = form.getFieldsValue([
            "endTime",
            "periodic",
        ]);

        const compareTime = addMinutes(beginTime, MIN_CLASS_DURATION);

        if (compareMinute(endTime, compareTime) < 0) {
            form.setFieldsValue({ endTime: compareTime });
        }

        syncPeriodicEndAmount(form, beginTime, periodic);
    }
}
