import React from "react";
import { Form } from "antd";
import { FlatI18nTFunction } from "@netless/flat-i18n";
import { FormInstance, RuleObject } from "antd/lib/form";
import { addMinutes, isBefore } from "date-fns";
import { EditRoomFormValues } from "./index";
import { excludeRange } from "../../../utils/room";
import { FullTimePicker } from "../FullTimePicker";
import { MIN_CLASS_DURATION } from "./constants";
import { isAllowed } from "./rules";

export function renderEndTimePicker(
    t: FlatI18nTFunction,
    form: FormInstance<EditRoomFormValues>,
    prevBeginTime?: number | null,
    nextBeginTime?: number | null,
    nextEndTime?: number | null,
): React.ReactElement {
    return (
        <Form.Item label={t("end-time")} name="endTime" rules={[validateTime]}>
            <FullTimePicker
                disabledDate={disabledDate}
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
            />
        </Form.Item>
    );

    function validateTime(): RuleObject {
        return {
            validator: (_, value: Date): Promise<void> => {
                const beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
                const compareTime = addMinutes(beginTime, MIN_CLASS_DURATION);
                if (isBefore(value, compareTime)) {
                    throw new Error(t("room-duration-limit", { minutes: MIN_CLASS_DURATION }));
                }
                return Promise.resolve();
            },
        };
    }

    function disabledDate(endTime: Date): boolean {
        const beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
        endTime = new Date(endTime);
        let allowed = false;
        out: for (const hour of excludeRange(24)) {
            for (const minute of excludeRange(60)) {
                endTime.setHours(hour);
                endTime.setMinutes(minute);
                if (isAllowed(beginTime, endTime, prevBeginTime, nextBeginTime, nextEndTime)) {
                    allowed = true;
                    break out;
                }
            }
        }
        return !allowed;
    }

    function disabledHours(): number[] {
        const beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
        let endTime: EditRoomFormValues["endTime"] = form.getFieldValue("endTime");
        endTime = new Date(endTime);
        endTime.setSeconds(0);
        endTime.setMilliseconds(0);
        const result: number[] = [];
        for (const hour of excludeRange(24)) {
            endTime.setHours(hour);
            if (
                !excludeRange(60).some(minute => {
                    endTime.setMinutes(minute);
                    return isAllowed(beginTime, endTime, prevBeginTime, nextBeginTime, nextEndTime);
                })
            ) {
                result.push(hour);
            }
        }
        return result;
    }

    function disabledMinutes(selectedHour: number): number[] {
        const beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
        let endTime: EditRoomFormValues["endTime"] = form.getFieldValue("endTime");
        endTime = new Date(endTime);
        endTime.setHours(selectedHour);
        endTime.setSeconds(0);
        endTime.setMilliseconds(0);
        const result: number[] = [];
        for (const minute of excludeRange(60)) {
            endTime.setMinutes(minute);
            if (!isAllowed(beginTime, endTime, prevBeginTime, nextBeginTime, nextEndTime)) {
                result.push(minute);
            }
        }
        return result;
    }
}
