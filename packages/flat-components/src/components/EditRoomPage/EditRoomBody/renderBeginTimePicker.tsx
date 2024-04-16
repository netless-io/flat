import React from "react";
import { Form } from "antd";
import { FlatI18nTFunction } from "@netless/flat-i18n";
import { FormInstance, RuleObject } from "antd/lib/form";
import { addMinutes, isBefore } from "date-fns";
import { EditRoomFormValues } from "./index";
import {
    compareMinute,
    excludeRange,
    getRoughNow,
    syncPeriodicEndAmount,
} from "../../../utils/room";
import { FullTimePicker } from "../FullTimePicker";
import { MIN_CLASS_DURATION } from "./constants";
import { isAllowed } from "./rules";

export function renderBeginTimePicker(
    t: FlatI18nTFunction,
    form: FormInstance<EditRoomFormValues>,
    prevBeginTime?: number | null,
    nextBeginTime?: number | null,
    nextEndTime?: number | null,
): React.ReactElement {
    return (
        <Form.Item label={t("begin-time")} name="beginTime" rules={[validateTime]}>
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
            validator(_, value: Date): Promise<void> {
                if (isBefore(value, getRoughNow())) {
                    throw new Error(t("begin-time-cannot-be-in-the-past"));
                }
                return Promise.resolve();
            },
        };
    }

    // This function has to iterate through every (43200) minutes of a month to find the available time.
    // There is a performance bottleneck.
    function disabledDate(beginTime: Date): boolean {
        beginTime = new Date(beginTime);
        let allowed = false;
        out: for (const hour of excludeRange(24)) {
            for (const minute of excludeRange(60)) {
                beginTime.setHours(hour);
                beginTime.setMinutes(minute);
                if (isAllowed(beginTime, null, prevBeginTime, nextBeginTime, nextEndTime)) {
                    allowed = true;
                    break out;
                }
            }
        }
        return !allowed;
    }

    function disabledHours(): number[] {
        let beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
        // Clone beginTime to avoid modifying the original value.
        beginTime = new Date(beginTime);
        beginTime.setSeconds(0);
        beginTime.setMilliseconds(0);
        const result: number[] = [];
        for (const hour of excludeRange(24)) {
            beginTime.setHours(hour);
            if (
                !excludeRange(60).some(minute => {
                    beginTime.setMinutes(minute);
                    return isAllowed(beginTime, null, prevBeginTime, nextBeginTime, nextEndTime);
                })
            ) {
                result.push(hour);
            }
        }
        return result;
    }

    function disabledMinutes(selectedHour: number): number[] {
        let beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
        beginTime = new Date(beginTime);
        beginTime.setHours(selectedHour);
        beginTime.setSeconds(0);
        beginTime.setMilliseconds(0);
        const result: number[] = [];
        for (const minute of excludeRange(60)) {
            beginTime.setMinutes(minute);
            if (!isAllowed(beginTime, null, prevBeginTime, nextBeginTime, nextEndTime)) {
                result.push(minute);
            }
        }
        return result;
    }

    /** make sure end time is at least min duration after begin time */
    function onBeginTimeChanged(beginTime: Date): void {
        const { endTime, periodic }: Pick<EditRoomFormValues, "endTime" | "periodic"> =
            form.getFieldsValue(["endTime", "periodic"]);

        const compareTime = addMinutes(beginTime, MIN_CLASS_DURATION * 2);

        if (compareMinute(endTime, compareTime) < 0) {
            form.setFieldsValue({ endTime: compareTime });
        }

        syncPeriodicEndAmount(form, beginTime, periodic);
    }
}
