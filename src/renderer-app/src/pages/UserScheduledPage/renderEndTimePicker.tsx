import React from "react";
import { Form, Row, Col } from "antd";
import { isBefore, isSameDay, addMinutes } from "date-fns";
import { FormInstance, RuleObject } from "antd/lib/form";
import { DatePicker, TimePicker } from "../../components/antd-date-fns";
import { CreatePeriodicFormValues } from "./typings";
import { getFinalDate, MIN_DURATION, syncPeriodicEndAmount } from "./utils";

export function renderEndTimePicker(
    form: FormInstance<CreatePeriodicFormValues>,
): React.ReactElement {
    return (
        <Form.Item label="结束时间">
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name={["endTime", "date"]} noStyle rules={[validateEndTimeDate]}>
                        <DatePicker
                            allowClear={false}
                            disabledDate={disableEndTimeDate}
                            onChange={onEndTimeDateChanged}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name={["endTime", "time"]} noStyle rules={[validateEndTimeTime]}>
                        <TimePicker
                            format="HH:mm"
                            allowClear={false}
                            disabledHours={disableEndTimeHours}
                            disabledMinutes={disableEndTimeMinutes}
                            onChange={onEndTimeTimeChanged}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form.Item>
    );

    function validateEndTimeDate(): RuleObject {
        return {
            validator: async (_, value: Date) => {
                const beginTime: CreatePeriodicFormValues["beginTime"] = form.getFieldValue(
                    "beginTime",
                );
                const compareTime = addMinutes(getFinalDate(beginTime), MIN_DURATION);
                if (isBefore(value, compareTime)) {
                    throw new Error(`结束日期须至少在开始日期 ${MIN_DURATION} 分钟以后`);
                }
            },
        };
    }

    function validateEndTimeTime(): RuleObject {
        return {
            validator: async (_, value: Date) => {
                const beginTime: CreatePeriodicFormValues["beginTime"] = form.getFieldValue(
                    "beginTime",
                );
                const endDate: CreatePeriodicFormValues["endTime"]["date"] = form.getFieldValue([
                    "endTime",
                    "date",
                ]);
                if (
                    isBefore(
                        getFinalDate({ date: endDate, time: value }),
                        addMinutes(getFinalDate(beginTime), MIN_DURATION),
                    )
                ) {
                    throw new Error(`结束时间须至少在开始时间 ${MIN_DURATION} 分钟以后`);
                }
            },
        };
    }

    /** disable date before begin time plus min duration  */
    function disableEndTimeDate(date: Date): boolean {
        return isBefore(
            date,
            addMinutes(getFinalDate(form.getFieldValue("beginTime")), MIN_DURATION),
        );
    }

    /** disable hours before begin time plus min duration */
    function disableEndTimeHours(): number[] {
        const {
            beginTime,
            endTime,
        }: Pick<CreatePeriodicFormValues, "beginTime" | "endTime"> = form.getFieldsValue([
            "beginTime",
            "endTime",
        ]);
        const compareDate = addMinutes(getFinalDate(beginTime), MIN_DURATION);
        return isSameDay(compareDate, endTime.date)
            ? Array(compareDate.getHours() + 1)
                  .fill(0)
                  .map((_, i) => i)
            : [];
    }

    /** disable minutes before begin time plus min duration */
    function disableEndTimeMinutes(): number[] {
        const {
            beginTime,
            endTime,
        }: Pick<CreatePeriodicFormValues, "beginTime" | "endTime"> = form.getFieldsValue([
            "beginTime",
            "endTime",
        ]);
        const compareDate = addMinutes(getFinalDate(beginTime), MIN_DURATION);
        return isSameDay(compareDate, endTime.date) &&
            compareDate.getHours() === endTime.time.getHours()
            ? Array(compareDate.getHours() + 1)
                  .fill(0)
                  .map((_, i) => i)
            : [];
    }

    function onEndTimeDateChanged(date: Date | null): void {
        if (date) {
            const {
                beginTime,
                endTime,
                periodic,
            }: Pick<
                CreatePeriodicFormValues,
                "beginTime" | "endTime" | "periodic"
            > = form.getFieldsValue(["beginTime", "endTime", "periodic"]);

            syncPeriodicEndAmount(form, beginTime, { date, time: endTime.time }, periodic);
        }
    }

    function onEndTimeTimeChanged(time: Date | null): void {
        if (time) {
            const {
                beginTime,
                endTime,
                periodic,
            }: Pick<
                CreatePeriodicFormValues,
                "beginTime" | "endTime" | "periodic"
            > = form.getFieldsValue(["beginTime", "endTime", "periodic"]);

            syncPeriodicEndAmount(form, beginTime, { date: endTime.date, time }, periodic);
        }
    }
}
