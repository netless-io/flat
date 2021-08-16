import { Col, Form, InputNumber, Row } from "antd";
import { FormInstance, RuleObject } from "antd/lib/form";
import { endOfDay, getDay, isBefore, startOfDay } from "date-fns";
import React from "react";
import { TFunction } from "react-i18next";
import { EditRoomFormValues } from ".";
import { Week } from "../../../types/room";
import { formatISODayWeekiii, getWeekNames, syncPeriodicEndAmount } from "../../../utils/room";
import { DatePicker } from "../FullTimePicker";
import { PeriodicEndTypeSelector } from "../PeriodicEndTypeSelector";
import { WeekRateSelector } from "../WeekRateSelector";

export const renderPeriodicForm = (t: TFunction<string>, lang: string) =>
    function renderPeriodicForm(form: FormInstance<EditRoomFormValues>) {
        const isPeriodic: EditRoomFormValues["isPeriodic"] = form.getFieldValue("isPeriodic");
        if (!isPeriodic) {
            return null;
        }

        return (
            <>
                <Form.Item
                    shouldUpdate={(prev: EditRoomFormValues, curr: EditRoomFormValues) =>
                        prev.periodic !== curr.periodic || prev.type !== curr.type
                    }
                >
                    {renderPeriodicRoomTips}
                </Form.Item>
                <Form.Item
                    label={t("frequency")}
                    name={["periodic", "weeks"]}
                    getValueFromEvent={onWeekSelected}
                >
                    <WeekRateSelector onChange={onWeekRateChanged} lang={lang} />
                </Form.Item>
                <Form.Item label={t("end-series")}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name={["periodic", "endType"]}>
                                <PeriodicEndTypeSelector />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                noStyle
                                shouldUpdate={(
                                    prev: EditRoomFormValues,
                                    curr: EditRoomFormValues,
                                ) => prev.periodic.endType !== curr.periodic.endType}
                            >
                                {renderPeriodicEndAmount}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            </>
        );

        function renderPeriodicRoomTips(): React.ReactElement {
            const { periodic, type: roomType }: Pick<EditRoomFormValues, "periodic" | "type"> =
                form.getFieldsValue(["periodic", "type"]);
            return (
                <div className="edit-room-tips">
                    {periodic.weeks.length > 0 ? (
                        <div className="edit-room-tips-title">
                            {t("every-frequency", { freq: getWeekNames(periodic.weeks, lang) })}
                        </div>
                    ) : (
                        <div>{t("no-frequency-selected")}</div>
                    )}
                    <div className="edit-room-tips-type">
                        {t("room-type")}
                        {t("colon")}
                        {t(`class-room-type.${roomType}`)}
                    </div>
                    <div className="edit-room-tips-inner">
                        {t("periodic-room-tip", {
                            date: formatISODayWeekiii(periodic.endTime, lang),
                            rate: periodic.rate,
                        })}
                    </div>
                </div>
            );
        }

        function renderPeriodicEndAmount(): React.ReactElement {
            return form.getFieldValue(["periodic", "endType"]) === "rate" ? (
                <Form.Item
                    name={["periodic", "rate"]}
                    rules={[
                        {
                            type: "integer",
                            min: 1,
                            message: t("no-less-than-one-room"),
                        },
                        {
                            type: "integer",
                            max: 50,
                            message: t("maximum-of-50-rooms-allowed"),
                        },
                    ]}
                >
                    <InputNumber min={1} max={50} precision={0} onChange={onPeriodicRateChanged} />
                </Form.Item>
            ) : (
                <Form.Item
                    name={["periodic", "endTime"]}
                    getValueFromEvent={(date: Date | null) => date && endOfDay(date)}
                    rules={[validatePeriodicEndTime]}
                >
                    <DatePicker
                        format="YYYY-MM-DD"
                        allowClear={false}
                        disabledDate={disablePeriodicEndTime}
                        onChange={onPeriodicEndTimeChanged}
                    />
                </Form.Item>
            );
        }

        function onWeekSelected(w: Week[]): Week[] {
            const week = getDay(form.getFieldValue("beginTime"));
            if (!w.includes(week)) {
                w.push(week);
            }
            return w.sort();
        }

        function onWeekRateChanged(weeks: Week[]): void {
            const { beginTime, periodic }: Pick<EditRoomFormValues, "beginTime" | "periodic"> =
                form.getFieldsValue(["beginTime", "periodic"]);
            syncPeriodicEndAmount(form, beginTime, { ...periodic, weeks });
        }

        function onPeriodicRateChanged(value: string | number | undefined): void {
            const rate = Number(value);
            if (!Number.isNaN(rate)) {
                const { beginTime, periodic }: Pick<EditRoomFormValues, "beginTime" | "periodic"> =
                    form.getFieldsValue(["beginTime", "periodic"]);
                syncPeriodicEndAmount(form, beginTime, { ...periodic, rate });
            }
        }

        function onPeriodicEndTimeChanged(date: Date | null): void {
            if (date) {
                const { beginTime, periodic }: Pick<EditRoomFormValues, "beginTime" | "periodic"> =
                    form.getFieldsValue(["beginTime", "periodic"]);
                syncPeriodicEndAmount(form, beginTime, { ...periodic, endTime: date });
            }
        }

        function disablePeriodicEndTime(currentTime: Date | null): boolean {
            if (currentTime) {
                const beginTime: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
                return isBefore(currentTime, startOfDay(beginTime));
            }
            return false;
        }

        function validatePeriodicEndTime(): RuleObject {
            return {
                validator: (_, value: Date): Promise<void> => {
                    const {
                        periodic,
                        beginTime,
                    }: Pick<EditRoomFormValues, "periodic" | "beginTime"> = form.getFieldsValue([
                        "periodic",
                        "beginTime",
                    ]);

                    if (periodic.rate > 50) {
                        throw new Error(t("maximum-of-50-rooms-allowed"));
                    }

                    if (isBefore(value, beginTime)) {
                        throw new Error(
                            t("end-series-date-cannot-be-less-than-the-begin-time-date"),
                        );
                    }
                    return Promise.resolve();
                },
            };
        }
    };
