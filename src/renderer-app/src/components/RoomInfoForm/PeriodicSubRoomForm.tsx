import { Button, Form, Input, Select } from "antd";
import { addMinutes, isBefore, startOfDay } from "date-fns";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import {
    periodicSubRoomInfo,
    updatePeriodicSubRoom,
    UpdatePeriodicSubRoomPayload,
} from "../../apiMiddleware/flatServer";
import { RoomType } from "../../apiMiddleware/flatServer/constants";
import LoadingPage from "../../LoadingPage";
import { DatePicker, TimePicker } from "../antd-date-fns";

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

const typeName = (type: RoomType): string => {
    const typeNameMap: Record<RoomType, string> = {
        [RoomType.OneToOne]: "一对一",
        [RoomType.SmallClass]: "小班课",
        [RoomType.BigClass]: "大班课",
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
    const history = useHistory();
    const isMount = useIsMount();

    const [form] = Form.useForm<PeriodicSubRoomFormData>();

    function disabledBeginDate(beginTime: Date): boolean {
        if (guard.current.prevTime) {
            return isBefore(beginTime, guard.current.prevTime);
        } else {
            return isBefore(beginTime, startOfDay(new Date()));
        }
    }

    function disabledEndDate(endTime: Date): boolean {
        if (guard.current.nextTime) {
            return isBefore(guard.current.nextTime, endTime);
        }
        return false;
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

    async function saveRoomInfo(): Promise<void> {
        const values = form.getFieldsValue();
        const requestBody: UpdatePeriodicSubRoomPayload = {
            beginTime: Number(values.beginTime),
            endTime: Number(values.endTime),
            roomUUID: roomUUID,
            periodicUUID: periodicUUID,
        };
        try {
            await updatePeriodicSubRoom(requestBody);
            if (isMount.current) {
                history.push("/user/");
            }
        } catch (error) {
            console.log(error);
        }
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
                    <Input disabled />
                </Form.Item>
                <div className="user-schedule-name">类型</div>
                <Form.Item name="type">
                    <Select disabled>
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
                            disabledDate={disabledBeginDate}
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
                            disabledDate={disabledEndDate}
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
                <Button className="user-schedule-cancel">取消</Button>
                <Button className="user-schedule-ok" disabled={disabled} onClick={saveRoomInfo}>
                    确定
                </Button>
            </div>
        </>
    );
});
