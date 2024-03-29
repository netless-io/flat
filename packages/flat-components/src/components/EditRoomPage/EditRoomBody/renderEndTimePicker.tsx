import { Form } from "antd";
import { FormInstance, RuleObject } from "antd/lib/form";
import { addMinutes, isAfter, isBefore, setHours } from "date-fns";
import React from "react";
import { FlatI18nTFunction } from "@netless/flat-i18n";
import type { EditRoomFormValues } from ".";
import { compareDay, compareHour, excludeRange } from "../../../utils/room";
import { FullTimePicker } from "../FullTimePicker";
import { MIN_CLASS_DURATION } from "./constants";

export function renderEndTimePicker(
    t: FlatI18nTFunction,
    form: FormInstance<EditRoomFormValues>,
    nextPeriodicRoomEndTime?: number | null,
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

    function disabledDate(date: Date): boolean {
        const beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
        if (nextPeriodicRoomEndTime) {
            const isBeforeTime = compareDay(addMinutes(beginTime, MIN_CLASS_DURATION), date) > 0;
            const isAfterTime = isAfter(date, nextPeriodicRoomEndTime);
            return isBeforeTime || isAfterTime;
        }
        return compareDay(addMinutes(beginTime, MIN_CLASS_DURATION), date) > 0;
    }

    function disabledHours(): number[] {
        const { beginTime, endTime }: Pick<EditRoomFormValues, "beginTime" | "endTime"> =
            form.getFieldsValue(["beginTime", "endTime"]);

        const compareTime = addMinutes(beginTime, MIN_CLASS_DURATION);
        const diff = compareDay(compareTime, endTime);

        if (nextPeriodicRoomEndTime) {
            const nextPeriodicEndTime = new Date(nextPeriodicRoomEndTime);
            const endDiff = compareDay(nextPeriodicEndTime, endTime);

            if (diff < 0) {
                if (endDiff === 0) {
                    return excludeRange(nextPeriodicEndTime.getHours() + 1, 23);
                }
                return [];
            }

            if (diff === 0) {
                if (endDiff === 0) {
                    return excludeRange(nextPeriodicEndTime.getHours() + 1, 23);
                }
                return excludeRange(compareTime.getHours());
            }

            return excludeRange(24);
        }

        if (diff < 0) {
            return [];
        }

        if (diff === 0) {
            return excludeRange(compareTime.getHours());
        }

        return excludeRange(24);
    }

    function disabledMinutes(selectedHour: number): number[] {
        const { beginTime, endTime }: Pick<EditRoomFormValues, "beginTime" | "endTime"> =
            form.getFieldsValue(["beginTime", "endTime"]);

        const comparedTime = addMinutes(beginTime, MIN_CLASS_DURATION);
        const selectedEndTime = setHours(endTime, selectedHour);

        const diff = compareHour(comparedTime, selectedEndTime);

        if (nextPeriodicRoomEndTime) {
            const nextPeriodicEndTime = new Date(nextPeriodicRoomEndTime);
            const endDiff = compareHour(nextPeriodicEndTime, endTime);

            if (diff < 0) {
                if (endDiff === 0) {
                    return excludeRange(nextPeriodicEndTime.getMinutes() + 1, 59);
                }
                return [];
            }

            if (diff === 0) {
                if (endDiff === 0) {
                    return excludeRange(nextPeriodicEndTime.getMinutes() + 1, 59);
                }
                return excludeRange(comparedTime.getMinutes());
            }

            return excludeRange(59);
        }

        if (diff < 0) {
            return [];
        }

        if (diff === 0) {
            return excludeRange(comparedTime.getMinutes());
        }

        return excludeRange(59);
    }
}
