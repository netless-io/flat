import React from "react";
import { Form, Row, Col } from "antd";
import { isBefore, startOfDay, isSameDay, addMinutes } from "date-fns";
import { FormInstance, RuleObject } from "antd/lib/form";
import { DatePicker, TimePicker } from "../../components/antd-date-fns";
import { ModifyPeriodicFormValues } from "./typings";
import { getFinalDate, MIN_DURATION, syncPeriodicEndAmount } from "./utils";

export function renderBeginTimePicker(
    form: FormInstance<ModifyPeriodicFormValues>,
): React.ReactElement {
    return (
        <Form.Item label="开始时间">
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name={["beginTime", "date"]} noStyle rules={[validateBeginTimeDate]}>
                        <DatePicker
                            allowClear={false}
                            disabledDate={disableBeginTimeDate}
                            onChange={onStartTimeDateChanged}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name={["beginTime", "time"]} noStyle rules={[validateBeginTimeTime]}>
                        <TimePicker
                            format="HH:mm"
                            allowClear={false}
                            disabledHours={disableBeginTimeHours}
                            disabledMinutes={disableBeginTimeMinutes}
                            onChange={onStartTimeTimeChanged}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form.Item>
    );

    function validateBeginTimeDate(): RuleObject {
        return {
            validator: async (_, value: Date) => {
                if (isBefore(value, startOfDay(new Date()))) {
                    throw new Error("开始日期不能为过去");
                }
            },
        };
    }

    function validateBeginTimeTime(): RuleObject {
        return {
            validator: async (_, value: Date) => {
                const beginDate: ModifyPeriodicFormValues["beginTime"]["date"] = form.getFieldValue(
                    ["beginTime", "date"],
                );
                if (
                    isBefore(getFinalDate({ date: beginDate, time: value }), startOfDay(new Date()))
                ) {
                    throw new Error("开始时间不能为过去");
                }
            },
        };
    }

    /** disable date before now  */
    function disableBeginTimeDate(date: Date): boolean {
        return isBefore(date, startOfDay(new Date()));
    }

    /** disable hours before now  */
    function disableBeginTimeHours(): number[] {
        const beginDate: ModifyPeriodicFormValues["beginTime"]["date"] = form.getFieldValue([
            "beginTime",
            "date",
        ]);
        const now = new Date();
        return isSameDay(beginDate, now)
            ? Array(now.getHours() + 1)
                  .fill(0)
                  .map((_, i) => i)
            : [];
    }

    /** disable minutes before now  */
    function disableBeginTimeMinutes(): number[] {
        const beginTime: ModifyPeriodicFormValues["beginTime"] = form.getFieldValue("beginTime");
        const now = new Date();
        return isSameDay(beginTime.date, now) && beginTime.time.getHours() === now.getHours()
            ? Array(now.getMinutes() + 1)
                  .fill(0)
                  .map((_, i) => i)
            : [];
    }

    /** make sure end time is at least 15mins after begin time */
    function syncEndTime(beginTime: ModifyPeriodicFormValues["beginTime"]): void {
        const endTime: ModifyPeriodicFormValues["endTime"] = form.getFieldValue("endTime");
        const periodic: ModifyPeriodicFormValues["periodic"] = form.getFieldValue("periodic");
        const finalEndTime = getFinalDate(endTime);
        const compareTime = addMinutes(getFinalDate(beginTime), MIN_DURATION);

        if (isBefore(finalEndTime, compareTime)) {
            const newEndTime = {
                date: new Date(compareTime),
                time: new Date(compareTime),
            };

            form.setFieldsValue({
                endTime: newEndTime,
            });

            syncPeriodicEndAmount(form, beginTime, newEndTime, periodic);
        } else {
            syncPeriodicEndAmount(form, beginTime, endTime, periodic);
        }
    }

    function onStartTimeDateChanged(date: Date | null): void {
        if (date) {
            const beginTimeTime: ModifyPeriodicFormValues["beginTime"]["time"] = form.getFieldValue(
                ["beginTime", "time"],
            );
            syncEndTime({ date, time: beginTimeTime });
        }
    }

    function onStartTimeTimeChanged(time: Date | null): void {
        if (time) {
            const beginTimeDate: ModifyPeriodicFormValues["beginTime"]["date"] = form.getFieldValue(
                ["beginTime", "date"],
            );
            syncEndTime({ date: beginTimeDate, time });
        }
    }
}
