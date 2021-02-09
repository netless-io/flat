import { Button, Col, Form, Input, message, Modal, Row, Select } from "antd";
import { RuleObject } from "antd/lib/form";
import {
    addMinutes,
    isBefore,
    isSameDay,
    isToday,
    roundToNearestMinutes,
    startOfDay,
} from "date-fns";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import {
    ordinaryRoomInfo,
    updateOrdinaryRoom,
    UpdateOrdinaryRoomPayload,
} from "../../apiMiddleware/flatServer";
import { RoomType } from "../../apiMiddleware/flatServer/constants";
import { DatePicker, TimePicker } from "../../components/antd-date-fns";
import LoadingPage from "../../LoadingPage";
import { useAPI, useSafePromise } from "../../utils/hooks/lifecycle";
import { ModifyRoomDefaultFormValues } from "./typings";
import { getFinalDate, MIN_DURATION } from "./utils";
export interface OrdinaryRoomFormProps {
    roomUUID: string;
}

interface OrdinaryRoomFormValues {
    title: string;
    beginTime: {
        date: Date;
        time: Date;
    };
    endTime: {
        date: Date;
        time: Date;
    };
    roomType: RoomType;
    roomUUID: string;
}

const typeName = (type: RoomType): string => {
    const typeNameMap: Record<RoomType, string> = {
        [RoomType.BigClass]: "大班课",
        [RoomType.SmallClass]: "小班课",
        [RoomType.OneToOne]: "一对一",
    };
    return typeNameMap[type];
};

const { Option } = Select;

function useIsMount(): React.MutableRefObject<boolean> {
    const isMount = useRef(false);

    useEffect(() => {
        isMount.current = true;
        return () => {
            isMount.current = false;
        };
    }, []);
    return isMount;
}

const getInitialBeginTime = (): Date => {
    let time = roundToNearestMinutes(Date.now(), { nearestTo: 30 });
    if (isBefore(time, Date.now())) {
        time = addMinutes(time, 30);
    }
    return time;
};

export const OrdinaryRoomForm = observer<OrdinaryRoomFormProps>(function RoomForm({ roomUUID }) {
    const [modifyModalVisible, setModifyModalVisible] = useState(false);
    const [isFormValidated, setIsFormValidated] = useState(true);
    const [isLoading, setLoading] = useState(false);

    const history = useHistory();
    const isMount = useIsMount();
    const sp = useSafePromise();

    const [form] = Form.useForm<OrdinaryRoomFormValues>();
    const [defaultValue] = useState<ModifyRoomDefaultFormValues>(() => ({
        title: "",
        beginDate: new Date(),
        beginTime: new Date(),
        endDate: new Date(),
        endTime: new Date(),
        roomType: RoomType.BigClass,
    }));

    const { first, fetch, loading, result: data } = useAPI(ordinaryRoomInfo);

    useEffect(() => {
        fetch(roomUUID);
    }, [fetch, roomUUID]);

    useEffect(() => {
        if (data) {
            const { title, roomType } = data.roomInfo;
            const { beginTime: nBeginTime, endTime: nEndTime } = data.roomInfo;
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
            });
        }
    }, [form, data]);

    if (first || loading) {
        return <LoadingPage />;
    }

    /** disable date before now  */
    function disableBeginTimeDate(date: Date): boolean {
        return isBefore(date, startOfDay(new Date()));
    }

    /** disable hours before now  */
    function disableBeginTimeHours(): number[] {
        const beginDate: OrdinaryRoomFormValues["beginTime"]["date"] = form.getFieldValue([
            "beginTime",
            "date",
        ]);
        return isToday(beginDate) ? Array.from(Array(new Date().getHours() + 1).keys()) : [];
    }

    function disableBeginTimeMinutes(): number[] {
        const beginTime: OrdinaryRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
        const now = new Date();
        return isToday(beginTime.date) && beginTime.time.getHours() === now.getHours()
            ? Array.from(Array(now.getMinutes() + 1).keys())
            : [];
    }

    function disableEndTimeDate(date: Date): boolean {
        return isBefore(date, startOfDay(form.getFieldValue("beginTime").date));
    }

    /** disable hours before begin time plus 30 minutes */
    function disableEndTimeHours(): number[] {
        const {
            beginTime,
            endTime,
        }: Pick<OrdinaryRoomFormValues, "beginTime" | "endTime"> = form.getFieldsValue([
            "beginTime",
            "endTime",
        ]);
        return isSameDay(beginTime.date, endTime.date)
            ? Array.from(Array(beginTime.time.getHours()).keys())
            : [];
    }

    /** disable minutes before begin time plus 30 minutes */
    function disableEndTimeMinutes(): number[] {
        const {
            beginTime,
            endTime,
        }: Pick<OrdinaryRoomFormValues, "beginTime" | "endTime"> = form.getFieldsValue([
            "beginTime",
            "endTime",
        ]);
        return isSameDay(beginTime.date, endTime.date) &&
            beginTime.time.getHours() === endTime.time.getHours()
            ? Array.from(Array(beginTime.time.getMinutes() + 1).keys())
            : [];
    }

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
                const beginDate: OrdinaryRoomFormValues["beginTime"]["date"] = form.getFieldValue([
                    "beginTime",
                    "date",
                ]);
                if (
                    isBefore(getFinalDate({ date: beginDate, time: value }), startOfDay(new Date()))
                ) {
                    throw new Error("开始时间不能为过去");
                }
            },
        };
    }

    function validateEndTimeDate(): RuleObject {
        return {
            validator: async () => {
                const { beginTime, endTime } = form.getFieldsValue(true);
                const compareTime = addMinutes(getFinalDate(beginTime), MIN_DURATION);
                if (isBefore(endTime.date, compareTime)) {
                    throw new Error(`结束日期须至少在开始日期 ${MIN_DURATION} 分钟以后`);
                }
                if (
                    isBefore(
                        getFinalDate(endTime),
                        addMinutes(getFinalDate(beginTime), MIN_DURATION),
                    )
                ) {
                    throw new Error(`房间时长最少 ${MIN_DURATION} 分钟`);
                }
            },
        };
    }

    function validateEndTimeTime(): RuleObject {
        return {
            validator: async (_, value: Date) => {
                const beginTime: OrdinaryRoomFormValues["beginTime"] = form.getFieldValue(
                    "beginTime",
                );
                const endDate: OrdinaryRoomFormValues["endTime"]["date"] = form.getFieldValue([
                    "endTime",
                    "date",
                ]);
                if (
                    isBefore(
                        getFinalDate({ date: endDate, time: value }),
                        addMinutes(getFinalDate(beginTime), MIN_DURATION),
                    )
                ) {
                    throw new Error(`房间时长最少 ${MIN_DURATION} 分钟`);
                }
            },
        };
    }

    function syncEndTime(beginTime: OrdinaryRoomFormValues["beginTime"]): void {
        const endTime: OrdinaryRoomFormValues["endTime"] = form.getFieldValue("endTime");
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
        }
    }

    function onStartTimeDateChanged(date: Date | null): void {
        if (date) {
            let beginTimeTime: OrdinaryRoomFormValues["beginTime"]["time"] = form.getFieldValue([
                "beginTime",
                "time",
            ]);
            if (isToday(date)) {
                beginTimeTime = getInitialBeginTime();
            }
            form.setFieldsValue({ beginTime: { date, time: beginTimeTime } });
            syncEndTime({ date, time: beginTimeTime });
        }
    }

    function onStartTimeTimeChanged(time: Date | null): void {
        if (time) {
            const beginTimeDate: OrdinaryRoomFormValues["beginTime"]["date"] = form.getFieldValue([
                "beginTime",
                "date",
            ]);
            syncEndTime({ date: beginTimeDate, time });
        }
    }

    async function modifyRoom(): Promise<void> {
        if (isLoading || !isFormValidated) {
            return;
        }

        setLoading(true);
        const values: OrdinaryRoomFormValues = form.getFieldsValue(true);
        const requestBody: UpdateOrdinaryRoomPayload = {
            beginTime: Number(getFinalDate(values.beginTime)),
            endTime: Number(getFinalDate(values.endTime)),
            title: values.title,
            type: values.roomType,
            docs: [],
            roomUUID: roomUUID,
        };
        try {
            await sp(updateOrdinaryRoom(requestBody));
            message.success("修改成功");
            if (isMount.current) {
                history.goBack();
            }
        } catch (error) {
            console.log(error);
        }
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

    function formValidateStatus(): void {
        setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
    }

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <>
            <Form
                form={form}
                initialValues={defaultValue}
                layout="vertical"
                className="modify-ordinary-room-form"
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
                    <Select>
                        {[RoomType.BigClass, RoomType.SmallClass, RoomType.OneToOne].map(e => {
                            return (
                                <Option key={e} value={e}>
                                    {typeName(e)}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
                <Form.Item label="开始时间">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name={["beginTime", "date"]}
                                noStyle
                                rules={[validateBeginTimeDate]}
                            >
                                <DatePicker
                                    allowClear={false}
                                    showToday={false}
                                    disabledDate={disableBeginTimeDate}
                                    onChange={onStartTimeDateChanged}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={["beginTime", "time"]}
                                noStyle
                                rules={[validateBeginTimeTime]}
                            >
                                <TimePicker
                                    allowClear={false}
                                    showNow={false}
                                    disabledHours={disableBeginTimeHours}
                                    disabledMinutes={disableBeginTimeMinutes}
                                    format="HH:mm"
                                    onChange={onStartTimeTimeChanged}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label="结束时间" shouldUpdate>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name={["endTime", "date"]}
                                noStyle
                                rules={[validateEndTimeDate]}
                            >
                                <DatePicker
                                    allowClear={false}
                                    showToday={false}
                                    disabledDate={disableEndTimeDate}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={["endTime", "time"]}
                                noStyle
                                rules={[validateEndTimeTime]}
                            >
                                <TimePicker
                                    allowClear={false}
                                    showNow={false}
                                    disabledHours={disableEndTimeHours}
                                    disabledMinutes={disableEndTimeMinutes}
                                    format="HH:mm"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
            <div className="modify-ordinary-room-under">
                <Button className="modify-ordinary-room-cancel" onClick={() => history.goBack()}>
                    取消
                </Button>
                <Button
                    className="modify-ordinary-room-ok"
                    loading={isLoading}
                    onClick={showModifyRoomModal}
                    disabled={!isLoading && !isFormValidated}
                >
                    修改
                </Button>
                {renderModifyModal()}
            </div>
        </>
    );

    function renderModifyModal(): React.ReactElement {
        return (
            <Modal
                visible={modifyModalVisible}
                title="修改房间"
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
});
