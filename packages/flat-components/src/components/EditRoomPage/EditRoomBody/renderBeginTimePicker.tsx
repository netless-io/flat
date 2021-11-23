import { Form } from "antd";
import { FormInstance, RuleObject } from "antd/lib/form";
import { addMinutes, isAfter, isBefore, setHours, startOfDay } from "date-fns";
import React from "react";
import { TFunction } from "react-i18next";
import { EditRoomFormValues } from ".";
import {
    compareDay,
    compareHour,
    compareMinute,
    excludeRange,
    getRoughNow,
    syncPeriodicEndAmount,
} from "../../../utils/room";
import { FullTimePicker } from "../FullTimePicker";
import { MIN_CLASS_DURATION } from "./constants";

export function renderBeginTimePicker(
    t: TFunction<string>,
    form: FormInstance<EditRoomFormValues>,
    previousPeriodicRoomBeginTime?: number | null,
    nextPeriodicRoomEndTime?: number | null,
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

    function disabledDate(date: Date): boolean {
        if (previousPeriodicRoomBeginTime && nextPeriodicRoomEndTime) {
            const isBeforeNow = isBefore(date, getRoughNow());
            const isBeforePreTime = isBefore(date, previousPeriodicRoomBeginTime);
            const isAfterNextTime = isAfter(date, nextPeriodicRoomEndTime);
            return isBeforePreTime || isAfterNextTime || isBeforeNow;
        } else if (nextPeriodicRoomEndTime && previousPeriodicRoomBeginTime === null) {
            const isBeforeNow = isBefore(date, startOfDay(getRoughNow()));
            const isAfterNextTime = isAfter(date, nextPeriodicRoomEndTime);
            return isBeforeNow || isAfterNextTime;
        } else if (previousPeriodicRoomBeginTime && nextPeriodicRoomEndTime === null) {
            const isBeforePreTime = isBefore(date, previousPeriodicRoomBeginTime);
            const isBeforeNow = isBefore(date, getRoughNow());
            return isBeforePreTime || isBeforeNow;
        }
        return isBefore(date, startOfDay(getRoughNow()));
    }

    function disabledHours(): number[] {
        const beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");

        const now = getRoughNow();

        const diff = compareDay(now, beginTime);
        if (previousPeriodicRoomBeginTime && nextPeriodicRoomEndTime) {
            const preBeginTime = new Date(previousPeriodicRoomBeginTime);
            const nextEndTime = new Date(nextPeriodicRoomEndTime);
            const diff = compareDay(preBeginTime, beginTime);
            const endDiff = compareDay(nextEndTime, beginTime);

            if (diff < 0) {
                if (endDiff === 0) {
                    if (nextEndTime.getMinutes() < 15) {
                        return excludeRange(nextEndTime.getHours(), 23);
                    }
                    return excludeRange(nextEndTime.getHours() + 1, 23);
                }
                return [];
            }

            if (diff === 0) {
                return excludeRange(preBeginTime.getHours());
            }

            return excludeRange(24);
        } else if (previousPeriodicRoomBeginTime) {
            const preBeginTime = new Date(previousPeriodicRoomBeginTime);
            const diff = compareDay(preBeginTime, beginTime);

            if (diff < 0) {
                return [];
            }

            if (diff === 0) {
                return excludeRange(preBeginTime.getHours());
            }
        }

        if (diff < 0) {
            return [];
        }

        if (diff === 0) {
            return excludeRange(now.getHours());
        }

        return excludeRange(24);
    }

    function disabledMinutes(selectedHour: number): number[] {
        const beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
        const now = getRoughNow();

        const diff = compareHour(now, setHours(beginTime, selectedHour));

        if (previousPeriodicRoomBeginTime && nextPeriodicRoomEndTime) {
            const preBeginTime = new Date(previousPeriodicRoomBeginTime);
            const nextEndTime = new Date(nextPeriodicRoomEndTime);
            const diff = compareHour(preBeginTime, setHours(beginTime, selectedHour));

            const sameHour = selectedHour === nextEndTime.getHours();

            if (diff < 0) {
                if (sameHour) {
                    return excludeRange(nextEndTime.getMinutes(), 59);
                }
                const isPreHours = nextEndTime.getHours() - selectedHour === 1;

                if (isPreHours) {
                    if (nextEndTime.getMinutes() < 15) {
                        const roomDurationCompareTime =
                            MIN_CLASS_DURATION - nextEndTime.getMinutes();
                        return excludeRange(60 - roomDurationCompareTime, 59);
                    }
                    return [];
                }
                return [];
            }

            if (diff === 0) {
                return excludeRange(preBeginTime.getMinutes() + 1);
            }

            return excludeRange(59);
        } else if (previousPeriodicRoomBeginTime) {
            const preBeginTime = new Date(previousPeriodicRoomBeginTime);
            const diff = compareHour(preBeginTime, setHours(beginTime, selectedHour));
            if (diff < 0) {
                return [];
            }

            if (diff === 0) {
                return excludeRange(preBeginTime.getMinutes() + 1);
            }

            return excludeRange(59);
        }

        if (diff < 0) {
            return [];
        }

        if (diff === 0) {
            return excludeRange(now.getMinutes());
        }

        return excludeRange(59);
    }

    /** make sure end time is at least min duration after begin time */
    function onBeginTimeChanged(beginTime: Date): void {
        const { endTime, periodic }: Pick<EditRoomFormValues, "endTime" | "periodic"> =
            form.getFieldsValue(["endTime", "periodic"]);

        const compareTime = addMinutes(beginTime, MIN_CLASS_DURATION);

        if (compareMinute(endTime, compareTime) < 0) {
            form.setFieldsValue({ endTime: compareTime });
        }

        syncPeriodicEndAmount(form, beginTime, periodic);
    }
}
