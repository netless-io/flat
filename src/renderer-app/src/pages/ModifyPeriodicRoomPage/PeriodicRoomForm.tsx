import { Button, Checkbox, Col, Form, Input, InputNumber, message, Modal, Row } from "antd";
import { RuleObject } from "antd/lib/form";
import { endOfDay, format, getDay, isBefore } from "date-fns";
import { zhCN } from "date-fns/locale";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import {
    periodicRoomInfo,
    updatePeriodicRoom,
    UpdatePeriodicRoomPayload
} from "../../apiMiddleware/flatServer";
import { RoomType, Week } from "../../apiMiddleware/flatServer/constants";
import { DatePicker } from "../../components/antd-date-fns";
import { RoomTypeSelect } from "../../components/RoomType";
import { PeriodicEndType } from "../../constants/Periodic";
import LoadingPage from "../../LoadingPage";
import { getRoomTypeName } from "../../utils/getTypeName";
import { useAPI, useSafePromise } from "../../utils/hooks/lifecycle";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import PeriodicEndTypeSelector from "./PeriodicEndTypeSelector";
import { renderBeginTimePicker } from "./renderBeginTimePicker";
import { renderEndTimePicker } from "./renderEndTimePicker";
import { ModifyPeriodicFormValues } from "./typings";
import { getFinalDate, syncPeriodicEndAmount, timeToRate } from "./utils";
import WeekRateSelector, { getWeekNames } from "./WeekRateSelector";

export interface PeriodicRoomFormProps {
    periodicUUID: string;
}

type PeriodicRoomFormValues = {
    title: string;
    beginDate: Date;
    beginTime: Date;
    endDate: Date;
    endTime: Date;
    roomType: RoomType;
    weeks: Week[];
    rate: number | null;
    periodicEndTime: Date;
    endType: PeriodicEndType;
};

function formatISODayWeekiii(date: Date): string {
    // TODO: i18n
    return format(date, "yyyy/MM/dd iii", { locale: zhCN });
}

export const PeriodicRoomForm = observer<PeriodicRoomFormProps>(function PeriodicRoomForm({
    periodicUUID,
}) {
    const pushHistory = usePushHistory();

    const [form] = Form.useForm<ModifyPeriodicFormValues>();
    const [isFormValidated, setIsFormValidated] = useState(true);
    const [isLoading, setLoading] = useState(false);
    const [modifyModalVisible, setModifyModalVisible] = useState(false);

    const sp = useSafePromise();

    const [defaultValue] = useState<PeriodicRoomFormValues>(() => ({
        title: "",
        beginDate: new Date(),
        beginTime: new Date(),
        endDate: new Date(),
        endTime: new Date(),
        roomType: RoomType.BigClass,
        weeks: [],
        rate: 1,
        periodicEndTime: new Date(),
        endType: PeriodicEndType.Rate,
    }));
    const { first, fetch, loading, result: data } = useAPI(periodicRoomInfo);

    useEffect(() => {
        fetch(periodicUUID);
    }, [fetch, periodicUUID]);

    useEffect(() => {
        if (data) {
            const { title, roomType, weeks, rate, endTime: periodicEndTime } = data.periodic;
            const endType = rate === null ? PeriodicEndType.Time : PeriodicEndType.Rate;
            const { beginTime: nBeginTime, endTime: nEndTime } = data.rooms[0];
            const [beginTime, endTime] = [new Date(nBeginTime), new Date(nEndTime)];
            form.setFieldsValue({
                title,
                roomType,
                beginTime: {
                    date: beginTime,
                    time: beginTime,
                },
                endTime: {
                    date: endTime,
                    time: endTime,
                },
                periodic: {
                    weeks,
                    rate: rate ?? timeToRate(beginTime, new Date(periodicEndTime), weeks),
                    endTime: new Date(periodicEndTime),
                    endType,
                },
            });
        }
    }, [form, data]);

    if (first || loading) {
        return <LoadingPage />;
    }

    return (
        <Form
            form={form}
            initialValues={defaultValue}
            layout="vertical"
            className="modify-periodic-room-form"
            onFieldsChange={formValidateStatus}
        >
            <Form.Item
                label="主题"
                name="title"
                required={false}
                rules={[
                    { required: true, message: "请输入主题" },
                    { max: 50, message: "主题最多为 50 个字符" },
                ]}
            >
                <Input placeholder="请输入房间主题" />
            </Form.Item>
            <Form.Item label="类型" name="roomType">
                <RoomTypeSelect />
            </Form.Item>
            {renderBeginTimePicker(form)}
            {renderEndTimePicker(form)}
            <Checkbox defaultChecked disabled>
                <span>周期性房间</span>
            </Checkbox>
            <Form.Item
                shouldUpdate={(prev: ModifyPeriodicFormValues, curr: ModifyPeriodicFormValues) =>
                    prev.periodic !== curr.periodic || prev.roomType !== curr.roomType
                }
            >
                {renderPeriodicRoomTips}
            </Form.Item>
            <Form.Item
                label="重复频率"
                name={["periodic", "weeks"]}
                getValueFromEvent={onWeekSelected}
            >
                <WeekRateSelector onChange={onWeekRateChanged} />
            </Form.Item>
            <Form.Item label="结束重复">
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
                                prev: ModifyPeriodicFormValues,
                                curr: ModifyPeriodicFormValues,
                            ) => prev.periodic.endType !== curr.periodic.endType}
                        >
                            {renderPeriodicEndAmount}
                        </Form.Item>
                    </Col>
                </Row>
            </Form.Item>
            <div className="modify-periodic-room-under">
                <Button
                    className="modify-periodic-room-cancel"
                    onClick={() => pushHistory(RouteNameType.HomePage)}
                >
                    取消
                </Button>
                <Button
                    className="modify-periodic-room-ok"
                    onClick={showModifyRoomModal}
                    loading={isLoading}
                    disabled={!isLoading && !isFormValidated}
                >
                    修改
                </Button>
                {renderModifyModal()}
            </div>
        </Form>
    );

    function onWeekSelected(w: Week[]): Week[] {
        const week = getDay(form.getFieldValue(["beginTime", "date"]));
        if (!w.includes(week)) {
            w.push(week);
        }
        return w.sort();
    }

    function onWeekRateChanged(weeks: Week[]): void {
        const {
            beginTime,
            endTime,
            periodic,
        }: Pick<
            ModifyPeriodicFormValues,
            "beginTime" | "endTime" | "periodic"
        > = form.getFieldsValue(["beginTime", "endTime", "periodic"]);
        syncPeriodicEndAmount(form, beginTime, endTime, { ...periodic, weeks });
    }

    function onPeriodicRateChanged(value: string | number | undefined): void {
        const rate = Number(value);
        if (!Number.isNaN(rate)) {
            const {
                beginTime,
                endTime,
                periodic,
            }: Pick<
                ModifyPeriodicFormValues,
                "beginTime" | "endTime" | "periodic"
            > = form.getFieldsValue(["beginTime", "endTime", "periodic"]);
            syncPeriodicEndAmount(form, beginTime, endTime, { ...periodic, rate });
        }
    }

    function onPeriodicEndTimeChanged(date: Date | null): void {
        if (date) {
            const {
                beginTime,
                endTime,
                periodic,
            }: Pick<
                ModifyPeriodicFormValues,
                "beginTime" | "endTime" | "periodic"
            > = form.getFieldsValue(["beginTime", "endTime", "periodic"]);
            syncPeriodicEndAmount(form, beginTime, endTime, { ...periodic, endTime: date });
        }
    }

    function disablePeriodicEndTime(currentTime: Date | null): boolean {
        if (currentTime) {
            const endTimeDate: ModifyPeriodicFormValues["endTime"]["date"] = form.getFieldValue([
                "endTime",
                "date",
            ]);
            return isBefore(currentTime, endTimeDate);
        }
        return false;
    }

    function calcRoomsTimes(): number {
        const periodic: ModifyPeriodicFormValues["periodic"] = form.getFieldValue("periodic");
        const initialBeginTime: ModifyPeriodicFormValues["beginTime"] = form.getFieldValue(
            "beginTime",
        );
        if (periodic.endType === PeriodicEndType.Rate) {
            return periodic.rate;
        }
        return timeToRate(initialBeginTime.date, periodic.endTime, periodic.weeks);
    }

    async function modifyRoom(): Promise<void> {
        if (isLoading || !isFormValidated) {
            return;
        }

        setLoading(true);
        try {
            const values: ModifyPeriodicFormValues = form.getFieldsValue(true);
            const requestBody: UpdatePeriodicRoomPayload = {
                periodicUUID: periodicUUID,
                beginTime: Number(values.beginTime.time),
                endTime: Number(values.endTime.time),
                title: values.title,
                type: values.roomType,
                periodic:
                    values.periodic.endType === PeriodicEndType.Rate
                        ? {
                              weeks: values.periodic.weeks,
                              rate: values.periodic.rate!,
                          }
                        : {
                              weeks: values.periodic.weeks,
                              endTime: Number(values.periodic.endTime),
                          },
                docs: [],
            };
            await sp(updatePeriodicRoom(requestBody));
            message.success("修改成功");
            pushHistory(RouteNameType.HomePage);
        } catch (e) {
            console.error(e);
        }
    }

    function renderPeriodicRoomTips(): React.ReactElement {
        const periodic: ModifyPeriodicFormValues["periodic"] = form.getFieldValue("periodic");
        const roomType: ModifyPeriodicFormValues["roomType"] = form.getFieldValue("roomType");
        return (
            <div className="modify-periodic-room-tips">
                {periodic.weeks.length > 0 ? (
                    <div className="modify-periodic-room-tips-title">
                        每{getWeekNames(periodic.weeks)}
                    </div>
                ) : (
                    <div>暂未选择频率</div>
                )}
                <div className="modify-periodic-room-tips-type">
                    房间类型：{getRoomTypeName(roomType)}
                </div>
                <div className="modify-periodic-room-tips-inner">
                    结束于 {formatISODayWeekiii(periodic.endTime)}
                    ，共 {calcRoomsTimes()} 个房间
                </div>
            </div>
        );
    }

    function renderPeriodicEndAmount(): React.ReactElement {
        return form.getFieldValue(["periodic", "endType"]) === PeriodicEndType.Rate ? (
            <Form.Item
                name={["periodic", "rate"]}
                rules={[
                    {
                        type: "number",
                        min: 1,
                        message: "不能少于 1 个房间",
                    },
                    {
                        type: "number",
                        max: 50,
                        message: "最多允许预定 50 个房间",
                    },
                ]}
            >
                <InputNumber min={1} max={50} onChange={onPeriodicRateChanged} />
            </Form.Item>
        ) : (
            <Form.Item
                name={["periodic", "endTime"]}
                rules={[validatePeriodicEndTime]}
                getValueFromEvent={(date: Date | null) => date && endOfDay(date)}
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

    function showModifyRoomModal(): void {
        setModifyModalVisible(true);
    }

    function hideModifyModal(): void {
        setModifyModalVisible(false);
    }

    async function confirmModifyRoom(): Promise<void> {
        setModifyModalVisible(false);
        await modifyRoom();
    }

    function renderModifyModal(): React.ReactElement {
        return (
            <Modal
                visible={modifyModalVisible}
                title="修改周期性房间"
                onCancel={hideModifyModal}
                onOk={confirmModifyRoom}
                footer={[
                    <Button key="Cancel" onClick={hideModifyModal}>
                        取消
                    </Button>,
                    <Button key="Ok" type="primary" onClick={confirmModifyRoom}>
                        确定
                    </Button>,
                ]}
            >
                确定修改该房间？
            </Modal>
        );
    }

    function validatePeriodicEndTime(): RuleObject {
        return {
            validator: async (_, value: Date) => {
                const {
                    periodic,
                    beginTime,
                }: Pick<ModifyPeriodicFormValues, "periodic" | "beginTime"> = form.getFieldsValue([
                    "periodic",
                    "beginTime",
                ]);

                if (periodic.rate > 50) {
                    throw new Error("最多允许预定 50 个房间");
                }

                if (isBefore(value, getFinalDate(beginTime))) {
                    throw new Error(`结束重复日期不能小于开始时间日期`);
                }
            },
        };
    }

    function formValidateStatus(): void {
        setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
    }
});
