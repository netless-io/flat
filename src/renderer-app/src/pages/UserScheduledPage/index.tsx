import "./UserScheduledPage.less";
import back from "../../assets/image/back.svg";

import React, { useContext, useRef, useState } from "react";
import {
    Button,
    Checkbox,
    Input,
    Form,
    InputNumber,
    Row,
    Col,
    Divider,
    Modal,
    message,
} from "antd";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { isBefore, addMinutes, roundToNearestMinutes, getDay, addWeeks, endOfDay } from "date-fns";
import { RoomType, Week } from "../../apiMiddleware/flatServer/constants";
import { PeriodicEndType } from "../../constants/Periodic";
import { generateRoutePath, RouteNameType, usePushHistory } from "../../utils/routes";
import { getRoomTypeName } from "../../utils/getTypeName";
import { DatePicker } from "../../components/antd-date-fns";
import MainPageLayout from "../../components/MainPageLayout";
import { RoomTypeSelect } from "../../components/RoomType";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { CreatePeriodicFormValues } from "./typings";
import { formatISODayWeekiii, getFinalDate, syncPeriodicEndAmount } from "./utils";
import { PeriodicEndTypeSelector } from "./PeriodicEndTypeSelector";
import { WeekRateSelector, getWeekNames } from "./WeekRateSelector";
import { renderBeginTimePicker } from "./renderBeginTimePicker";
import { renderEndTimePicker } from "./renderEndTimePicker";
import { useSafePromise } from "../../utils/hooks/lifecycle";

const getInitialBeginTime = (): Date => {
    let time = roundToNearestMinutes(Date.now(), { nearestTo: 30 });
    if (isBefore(time, Date.now())) {
        time = addMinutes(time, 30);
    }
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
            type: RoomType.OneToOne,
            isPeriodic: false,
            beginTime: {
                date: new Date(scheduleBeginTime),
                time: new Date(scheduleBeginTime),
            },
            endTime: {
                date: addMinutes(scheduleBeginTime, 30),
                time: addMinutes(scheduleBeginTime, 30),
            },
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

    function renderPeriodicForm(): React.ReactElement | null {
        const isPeriodic: CreatePeriodicFormValues["isPeriodic"] = form.getFieldValue("isPeriodic");
        if (!isPeriodic) {
            return null;
        }

        return (
            <>
                <Form.Item
                    shouldUpdate={(
                        prev: CreatePeriodicFormValues,
                        curr: CreatePeriodicFormValues,
                    ) => prev.periodic !== curr.periodic || prev.type !== curr.type}
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
                                    prev: CreatePeriodicFormValues,
                                    curr: CreatePeriodicFormValues,
                                ) => prev.periodic.endType !== curr.periodic.endType}
                            >
                                {renderPeriodicEndAmount}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            </>
        );
    }

    function renderPeriodicRoomTips(): React.ReactElement {
        const periodic: CreatePeriodicFormValues["periodic"] = form.getFieldValue("periodic");
        const roomType: CreatePeriodicFormValues["type"] = form.getFieldValue("type");
        return (
            <div className="create-periodic-room-tips">
                {periodic.weeks.length > 0 ? (
                    <div className="create-periodic-room-tips-title">
                        每{getWeekNames(periodic.weeks)}
                    </div>
                ) : (
                    <div>暂未选择频率</div>
                )}
                <div className="create-periodic-room-tips-type">
                    房间类型：{getRoomTypeName(roomType)}
                </div>
                <div className="create-periodic-room-tips-inner">
                    结束于 {formatISODayWeekiii(periodic.endTime)}
                    ，共 {periodic.rate} 个房间
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

    function onToggleIsPeriodic(e: CheckboxChangeEvent): void {
        if (e.target.checked) {
            const today = form.getFieldValue(["beginTime", "date"]);
            form.setFieldsValue({
                periodic: {
                    weeks: [getDay(today)],
                    rate: 7,
                    endTime: endOfDay(addWeeks(today, 7)),
                },
            });
        }
    }

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
            CreatePeriodicFormValues,
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
                CreatePeriodicFormValues,
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
                CreatePeriodicFormValues,
                "beginTime" | "endTime" | "periodic"
            > = form.getFieldsValue(["beginTime", "endTime", "periodic"]);
            syncPeriodicEndAmount(form, beginTime, endTime, { ...periodic, endTime: date });
        }
    }

    function disablePeriodicEndTime(currentTime: Date | null): boolean {
        if (currentTime) {
            const endTimeDate: CreatePeriodicFormValues["endTime"]["date"] = form.getFieldValue([
                "endTime",
                "date",
            ]);
            return isBefore(currentTime, endTimeDate);
        }
        return false;
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
                beginTime: getFinalDate(values.beginTime).valueOf(),
                endTime: getFinalDate(values.endTime).valueOf(),
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

            pushHistory(RouteNameType.HomePage, {});
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
                    pushHistory(RouteNameType.HomePage, {});
                },
            });
        } else {
            pushHistory(RouteNameType.HomePage, {});
        }
    }

    function formValidateStatus(): void {
        setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
    }
});

export default UserScheduledPage;
