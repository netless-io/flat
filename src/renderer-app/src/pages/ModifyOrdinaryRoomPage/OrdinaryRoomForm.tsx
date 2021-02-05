import { Button, Col, Form, Input, message, Modal, Row, Select } from "antd";
import { addMinutes, differenceInMinutes, isBefore, startOfDay } from "date-fns";
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
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { usePushHistory } from "../../utils/routes";

export interface OrdinaryRoomFormProps {
    roomUUID: string;
}

type OrdinaryRoomFormData = {
    title: string;
    beginDate: Date;
    beginTime: Date;
    endDate: Date;
    endTime: Date;
    type: RoomType;
    roomUUID: string;
    periodicUUID: string;
};

const typeName = (type: RoomType): string => {
    const typeNameMap: Record<RoomType, string> = {
        [RoomType.OneToOne]: "一对一",
        [RoomType.SmallClass]: "小班课",
        [RoomType.BigClass]: "大班课",
    };
    return typeNameMap[type];
};

const { Option } = Select;

function disabledDate(beginTime: Date): boolean {
    return isBefore(beginTime, startOfDay(new Date()));
}

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

export const OrdinaryRoomForm = observer<OrdinaryRoomFormProps>(function RoomForm({ roomUUID }) {
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(true);
    const [modifyModalVisible, setModifyModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const isMount = useIsMount();
    const sp = useSafePromise();

    const [form] = Form.useForm<OrdinaryRoomFormData>();

    useEffect(() => {
        async function getRoomInfo(roomUUID: string): Promise<void> {
            try {
                const data = await ordinaryRoomInfo(roomUUID);

                if (isMount.current) {
                    if (data) {
                        setLoading(false);
                        if (data.roomInfo.title) {
                            setDisabled(false);
                        }
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

        if (roomUUID) {
            getRoomInfo(roomUUID);
        } else {
            form.setFieldsValue({});
        }
    }, [roomUUID, form, isMount]);

    async function modifyRoom(): Promise<void> {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        const values = form.getFieldsValue();
        const requestBody: UpdateOrdinaryRoomPayload = {
            beginTime: Number(values.beginTime),
            endTime: Number(values.endTime),
            title: values.title,
            type: values.type,
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

    function onValuesChange(
        changed: Partial<OrdinaryRoomFormData>,
        values: OrdinaryRoomFormData,
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
                onValuesChange={onValuesChange}
                layout="vertical"
                className="modify-ordinary-room-form"
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
                <Form.Item label="类型" name="type">
                    <Select>
                        {[RoomType.OneToOne, RoomType.SmallClass, RoomType.BigClass].map(e => {
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
                            <Form.Item name="beginDate">
                                <DatePicker
                                    className="user-schedule-picker"
                                    allowClear={false}
                                    showToday={false}
                                    disabledDate={disabledDate}
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
                                    disabledDate={disabledDate}
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
                    onClick={showModifyRoomModal}
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
                title="修改普通房间"
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
