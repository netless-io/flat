import { Button, Col, Form, Input, message, Modal, Row, Select } from "antd";
import { addMinutes, differenceInMinutes, isBefore, startOfDay } from "date-fns";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import {
    periodicSubRoomInfo,
    updatePeriodicSubRoom,
    UpdatePeriodicSubRoomPayload,
} from "../../apiMiddleware/flatServer";
import { RoomType } from "../../apiMiddleware/flatServer/constants";
import { DatePicker, TimePicker } from "../../components/antd-date-fns";
import LoadingPage from "../../LoadingPage";
import { getRoomTypeName } from "../../utils/getTypeName";
import { useSafePromise } from "../../utils/hooks/lifecycle";
export interface PeriodicSubRoomFormProps {
    roomUUID: string;
    periodicUUID: string;
}

type PeriodicSubRoomFormData = {
    title: string;
    beginDate: Date;
    beginTime: Date;
    endDate: Date;
    endTime: Date;
    type: RoomType;
    roomUUID: string;
    periodicUUID: string;
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

export const PeriodicSubRoomForm = observer<PeriodicSubRoomFormProps>(function RoomForm({
    roomUUID,
    periodicUUID,
}) {
    const guard = useRef<{
        prevTime: number | null;
        nextTime: number | null;
    }>({ prevTime: null, nextTime: null });
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(true);
    const [roomType, setRoomType] = useState(RoomType.BigClass);
    const [modifyModalVisible, setModifyModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const isMount = useIsMount();
    const sp = useSafePromise();

    const [form] = Form.useForm<PeriodicSubRoomFormData>();

    function disabledBeginDate(beginTime: Date): boolean {
        let isBeforePrevTime = false;
        if (guard.current.prevTime) {
            isBeforePrevTime = isBefore(beginTime, guard.current.prevTime);
        }
        const isBeforeNow = isBefore(beginTime, startOfDay(new Date()));
        return isBeforePrevTime || isBeforeNow;
    }

    function disabledEndDate(endTime: Date): boolean {
        let isAfterNextTime = false;
        if (guard.current.nextTime) {
            isAfterNextTime = isBefore(guard.current.nextTime, endTime);
        }
        const isBeforeNow = isBefore(endTime, new Date());
        return isAfterNextTime || isBeforeNow;
    }

    useEffect(() => {
        async function getRoomInfo(): Promise<void> {
            try {
                const data = await periodicSubRoomInfo({
                    roomUUID,
                    periodicUUID,
                    needOtherRoomTimeInfo: true,
                });

                if (isMount.current) {
                    if (data) {
                        setLoading(false);
                        if (data.roomInfo.title) {
                            setDisabled(false);
                        }
                        guard.current.prevTime = data.previousPeriodicRoomBeginTime;
                        guard.current.nextTime = data.nextPeriodicRoomEndTime;
                        setRoomType(data.roomInfo.roomType);
                        form.setFieldsValue({
                            title: data.roomInfo.title,
                            type: data.roomInfo.roomType,
                            beginTime: new Date(data.roomInfo.beginTime),
                            beginDate: new Date(data.roomInfo.beginTime),
                            endDate: new Date(data.roomInfo.endTime),
                            endTime: new Date(data.roomInfo.endTime),
                        });
                    }
                }
            } catch (err) {
                console.warn(err);
            }
        }

        if (periodicUUID) {
            getRoomInfo();
        } else {
            form.setFieldsValue({});
        }
    }, [roomUUID, periodicUUID, form, isMount]);

    async function modifySubRoom(): Promise<void> {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        const values = form.getFieldsValue();
        const requestBody: UpdatePeriodicSubRoomPayload = {
            beginTime: Number(values.beginTime),
            endTime: Number(values.endTime),
            roomUUID: roomUUID,
            periodicUUID: periodicUUID,
        };
        try {
            await sp(updatePeriodicSubRoom(requestBody));
            message.success("修改成功");
            if (isMount.current) {
                history.goBack();
            }
        } catch (error) {
            console.log(error);
        }
    }

    function showModifySubRoomModal(): void {
        setModifyModalVisible(true);
    }

    function hideModifyModal(): void {
        setModifyModalVisible(false);
    }

    async function confirmSubModifyRoom(): Promise<void> {
        setModifyModalVisible(false);
        await modifySubRoom();
    }

    function onValuesChange(
        changed: Partial<PeriodicSubRoomFormData>,
        values: PeriodicSubRoomFormData,
    ): void {
        let beginTime: Date | null = null;
        beginTime = changed.beginDate ?? changed.beginTime ?? null;
        let endTime: Date | null = null;
        endTime = changed.endDate ?? changed.endTime ?? null;
        if (beginTime ?? endTime) {
            if (!beginTime) {
                beginTime = values.beginDate;
            }
            if (!endTime) {
                endTime = values.endDate;
            }
            if (differenceInMinutes(beginTime, endTime) < 15) {
                endTime = addMinutes(beginTime, 30);
            }
            form.setFieldsValue({
                beginDate: beginTime,
                beginTime: beginTime,
                endDate: endTime,
                endTime: endTime,
            });
        }

        if (changed.type) {
            form.setFieldsValue({
                type: changed.type,
            });
        }

        if ("title" in changed) {
            form.setFieldsValue({
                title: changed.title,
            });
            setDisabled(!changed.title);
        }
    }

    if (loading) {
        return <LoadingPage />;
    }
    return (
        <>
            <Form
                form={form}
                layout="vertical"
                className="modify-ordinary-room-form"
                onValuesChange={onValuesChange}
            >
                <Form.Item
                    label="主题"
                    name="title"
                    required={false}
                    rules={[{ required: true, message: "主题不能为空" }]}
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item label="类型" name="type">
                    <Select disabled>
                        <Option key={roomType} value={roomType}>
                            {getRoomTypeName(roomType)}
                        </Option>
                    </Select>
                </Form.Item>
                <Form.Item label="开始时间">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="beginDate">
                                <DatePicker
                                    className="user-schedule-picker"
                                    allowClear={false}
                                    showToday={false}
                                    disabledDate={disabledBeginDate}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="beginTime">
                                <TimePicker
                                    className="user-schedule-picker"
                                    allowClear={false}
                                    showNow={false}
                                    format="HH:mm"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label="结束时间">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="endDate" noStyle>
                                <DatePicker
                                    allowClear={false}
                                    showToday={false}
                                    disabledDate={disabledEndDate}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="endTime" noStyle>
                                <TimePicker allowClear={false} showNow={false} format="HH:mm" />
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
                    disabled={disabled}
                    loading={isLoading}
                    onClick={showModifySubRoomModal}
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
                title="修改周期性子房间"
                onCancel={hideModifyModal}
                onOk={confirmSubModifyRoom}
                footer={[
                    <Button key="Cancel" onClick={hideModifyModal}>
                        取消
                    </Button>,
                    <Button key="Ok" type="primary" onClick={confirmSubModifyRoom}>
                        确定
                    </Button>,
                ]}
            >
                确定修改该房间？
            </Modal>
        );
    }
});
