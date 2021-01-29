import { Button, Form, Input, Select } from "antd";
import { addMinutes, isBefore, startOfDay } from "date-fns";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import {
    ordinaryRoomInfo,
    updateOrdinaryRoom,
    UpdateOrdinaryRoomPayload,
} from "../../apiMiddleware/flatServer";
import { RoomType } from "../../apiMiddleware/flatServer/constants";
import { DatePicker, TimePicker } from "../../components/antd-date-fns";
import LoadingPage from "../../LoadingPage";
import { RouteNameType, usePushHistory } from "../../utils/routes";

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
    const pushHistory = usePushHistory();
    const isMount = useIsMount();

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

    async function saveRoomInfo(): Promise<void> {
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
            await updateOrdinaryRoom(requestBody);
            if (isMount.current) {
                pushHistory(RouteNameType.HomePage, {});
            }
        } catch (error) {
            console.log(error);
        }
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
            if (isBefore(endTime, beginTime)) {
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
            <Form form={form} onValuesChange={onValuesChange}>
                <div className="user-schedule-name">主题</div>
                <Form.Item name="title" rules={[{ required: true, message: "主题不能为空" }]}>
                    <Input />
                </Form.Item>
                <div className="user-schedule-name">类型</div>
                <Form.Item name="type">
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
                <div className="user-schedule-name">开始时间</div>
                <div className="user-schedule-inner">
                    <Form.Item name="beginDate">
                        <DatePicker
                            className="user-schedule-picker"
                            allowClear={false}
                            showToday={false}
                            disabledDate={disabledDate}
                        />
                    </Form.Item>
                    <Form.Item name="beginTime">
                        <TimePicker
                            className="user-schedule-picker"
                            allowClear={false}
                            showNow={false}
                            format="HH:mm"
                        />
                    </Form.Item>
                </div>
                <div className="user-schedule-name">结束时间</div>
                <div className="user-schedule-inner">
                    <Form.Item name="endDate">
                        <DatePicker
                            className="user-schedule-picker"
                            allowClear={false}
                            showToday={false}
                            disabledDate={disabledDate}
                        />
                    </Form.Item>
                    <Form.Item name="endTime">
                        <TimePicker
                            className="user-schedule-picker"
                            allowClear={false}
                            showNow={false}
                            format="HH:mm"
                        />
                    </Form.Item>
                </div>
            </Form>
            <div className="user-schedule-under">
                <Button
                    className="user-schedule-cancel"
                    onClick={() => pushHistory(RouteNameType.HomePage, {})}
                >
                    取消
                </Button>
                <Button className="user-schedule-ok" disabled={disabled} onClick={saveRoomInfo}>
                    确定
                </Button>
            </div>
        </>
    );
});
