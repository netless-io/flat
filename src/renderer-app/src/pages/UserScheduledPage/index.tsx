import "./UserScheduledPage.less";
import back from "../../assets/image/back.svg";

import React, { useContext, useRef, useState } from "react";
import { Button, Checkbox, Input, Form, Divider, Modal, message } from "antd";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { isBefore, addMinutes, roundToNearestMinutes, getDay, addWeeks, endOfDay } from "date-fns";
import { RoomType } from "../../apiMiddleware/flatServer/constants";
import { PeriodicEndType } from "../../constants/Periodic";
import { generateRoutePath, RouteNameType, usePushHistory } from "../../utils/routes";
import MainPageLayout from "../../components/MainPageLayout";
import { RoomTypeSelect } from "../../components/RoomType";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { CreatePeriodicFormValues } from "./typings";
import { renderBeginTimePicker } from "./renderBeginTimePicker";
import { renderEndTimePicker } from "./renderEndTimePicker";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { renderPeriodicForm } from "./renderPeriodicForm";

const getInitialBeginTime = (): Date => {
    const now = new Date();
    let time = roundToNearestMinutes(now, { nearestTo: 30 });
    if (isBefore(time, now)) {
        time = addMinutes(time, 30);
    }
    time.setSeconds(0);
    time.setMilliseconds(0);
    return time;
};

export const UserScheduledPage = observer(function UserScheduledPage() {
    const pushHistory = usePushHistory();
    const sp = useSafePromise();
    const roomStore = useContext(RoomStoreContext);
    const globalStore = useContext(GlobalStoreContext);

    const [isFormValidated, setIsFormValidated] = useState(true);
    const [isLoading, setLoading] = useState(false);

    const hasInputAutoSelectedRef = useRef(false);

    const [form] = Form.useForm<CreatePeriodicFormValues>();

    const [defaultValues] = useState<CreatePeriodicFormValues>(() => {
        const scheduleBeginTime = getInitialBeginTime();
        return {
            title: globalStore.wechat?.name ? `${globalStore.wechat.name}预定的房间` : "",
            type: RoomType.BigClass,
            isPeriodic: false,
            beginTime: new Date(scheduleBeginTime),
            endTime: addMinutes(scheduleBeginTime, 30),
            periodic: {
                endType: PeriodicEndType.Rate,
                weeks: [getDay(scheduleBeginTime)],
                rate: 7,
                endTime: addWeeks(addMinutes(scheduleBeginTime, 30), 6),
            },
        };
    });

    return (
        <MainPageLayout>
            <div className="create-periodic-room-box">
                <div className="create-periodic-room-nav">
                    <div className="create-periodic-room-head">
                        <Link
                            to={generateRoutePath(RouteNameType.HomePage, {})}
                            onClick={e => {
                                e.preventDefault();
                                cancelSchedule();
                            }}
                            className="create-periodic-room-back"
                        >
                            <img src={back} alt="back" />
                            <span>返回</span>
                        </Link>
                        <Divider type="vertical" />
                        <h1 className="create-periodic-room-title">预定房间</h1>
                    </div>
                </div>
                <div className="create-periodic-room-body">
                    <div className="create-periodic-room-mid">
                        <Form
                            form={form}
                            layout="vertical"
                            name="createRoom"
                            initialValues={defaultValues}
                            className="create-periodic-room-form"
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
                                <Input
                                    placeholder="请输入房间主题"
                                    ref={input => {
                                        if (hasInputAutoSelectedRef.current) {
                                            return;
                                        }
                                        if (input) {
                                            input.focus();
                                            input.select();
                                            hasInputAutoSelectedRef.current = true;
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item label="类型" name="type">
                                <RoomTypeSelect />
                            </Form.Item>
                            {renderBeginTimePicker(form)}
                            {renderEndTimePicker(form)}
                            <Form.Item name="isPeriodic" valuePropName="checked">
                                <Checkbox onChange={onToggleIsPeriodic}>
                                    <span className="create-periodic-room-cycle">周期性房间</span>
                                </Checkbox>
                            </Form.Item>
                            <Form.Item
                                noStyle
                                shouldUpdate={(
                                    prev: CreatePeriodicFormValues,
                                    curr: CreatePeriodicFormValues,
                                ) => prev.isPeriodic !== curr.isPeriodic}
                            >
                                {renderPeriodicForm}
                            </Form.Item>
                        </Form>
                        <div className="create-periodic-room-under">
                            <Button
                                className="create-periodic-room-cancel"
                                onClick={cancelSchedule}
                            >
                                取消
                            </Button>
                            <Button
                                className="create-periodic-room-ok"
                                onClick={createRoom}
                                loading={isLoading}
                                disabled={!isLoading && !isFormValidated}
                            >
                                预定
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainPageLayout>
    );

    function onToggleIsPeriodic(e: CheckboxChangeEvent): void {
        if (e.target.checked) {
            const today: CreatePeriodicFormValues["beginTime"] = form.getFieldValue("beginTime");
            form.setFieldsValue({
                periodic: {
                    weeks: [getDay(today)],
                    rate: 7,
                    endTime: endOfDay(addWeeks(today, 7)),
                },
            });
        }
    }

    async function createRoom(): Promise<void> {
        if (isLoading || !isFormValidated) {
            return;
        }

        setLoading(true);

        try {
            const values: CreatePeriodicFormValues = form.getFieldsValue(true);
            const basePayload = {
                title: values.title,
                type: values.type,
                beginTime: values.beginTime.valueOf(),
                endTime: values.endTime.valueOf(),
            };

            if (values.isPeriodic) {
                await sp(
                    roomStore.createPeriodicRoom({
                        ...basePayload,
                        periodic:
                            values.periodic.endType === PeriodicEndType.Rate
                                ? {
                                      weeks: values.periodic.weeks,
                                      rate: values.periodic.rate,
                                  }
                                : {
                                      weeks: values.periodic.weeks,
                                      endTime: values.periodic.endTime.valueOf(),
                                  },
                    }),
                );
            } else {
                await sp(roomStore.createOrdinaryRoom(basePayload));
            }

            pushHistory(RouteNameType.HomePage);
        } catch (e) {
            console.error(e);
            message.error(e.message);
            setLoading(false);
        }
    }

    function cancelSchedule(): void {
        if (form.isFieldsTouched()) {
            Modal.confirm({
                content: "房间尚未预定，是否返回？",
                onOk() {
                    pushHistory(RouteNameType.HomePage);
                },
            });
        } else {
            pushHistory(RouteNameType.HomePage);
        }
    }

    function formValidateStatus(): void {
        setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
    }
});

export default UserScheduledPage;
