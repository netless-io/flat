import "./EditRoomPage.less";
import back from "../../assets/image/back.svg";

import React, { useRef, useState } from "react";
import { Button, Checkbox, Input, Form, Divider, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { Link, useHistory } from "react-router-dom";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { getDay, addWeeks, endOfDay } from "date-fns";
import { generateRoutePath, RouteNameType } from "../../utils/routes";
import MainPageLayout from "../../components/MainPageLayout";
import { RoomTypeSelect } from "../../components/RoomType";
import { EditRoomFormValues } from "./typings";
import { renderBeginTimePicker } from "./renderBeginTimePicker";
import { renderEndTimePicker } from "./renderEndTimePicker";
import { renderPeriodicForm } from "./renderPeriodicForm";

export type { EditRoomFormValues } from "./typings";

export enum EditRoomType {
    Schedule,
    EditOrdinary,
    EditPeriodic,
    EditPeriodicSub,
}

export interface EditRoomPageProps {
    type: EditRoomType;
    initialValues: EditRoomFormValues;
    loading: boolean;
    onSubmit: (value: EditRoomFormValues) => void;
}

export const EditRoomPage = observer<EditRoomPageProps>(function EditRoomPage({
    type,
    initialValues,
    loading,
    onSubmit,
}) {
    const history = useHistory();

    const [isFormVetted, setIsFormVetted] = useState(true);

    const hasInputAutoSelectedRef = useRef(false);

    const [form] = Form.useForm<EditRoomFormValues>();

    return (
        <MainPageLayout>
            <div className="edit-room-box">
                <div className="edit-room-nav">
                    <div className="edit-room-head">
                        <Link
                            to={generateRoutePath(RouteNameType.HomePage, {})}
                            onClick={e => {
                                e.preventDefault();
                                cancelSchedule();
                            }}
                            className="edit-room-back"
                        >
                            <img src={back} alt="back" />
                            <span>返回</span>
                        </Link>
                        <Divider type="vertical" />
                        <h1 className="edit-room-title">
                            {type === EditRoomType.Schedule ? "预定房间" : "修改房间"}
                        </h1>
                    </div>
                </div>
                <div className="edit-room-body">
                    <div className="edit-room-mid">
                        <Form
                            form={form}
                            layout="vertical"
                            name="createRoom"
                            initialValues={initialValues}
                            className="edit-room-form"
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
                                    disabled={type === EditRoomType.EditPeriodicSub}
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
                                <RoomTypeSelect disabled={type === EditRoomType.EditPeriodicSub} />
                            </Form.Item>
                            {renderBeginTimePicker(form)}
                            {renderEndTimePicker(form)}
                            {type === EditRoomType.Schedule ? (
                                <Form.Item name="isPeriodic" valuePropName="checked">
                                    <Checkbox onChange={onToggleIsPeriodic}>
                                        <span className="edit-room-cycle">周期性房间</span>
                                    </Checkbox>
                                </Form.Item>
                            ) : (
                                <Form.Item>
                                    <span className="edit-room-cycle">周期性房间</span>
                                </Form.Item>
                            )}
                            <Form.Item
                                noStyle
                                shouldUpdate={(
                                    prev: EditRoomFormValues,
                                    curr: EditRoomFormValues,
                                ) => prev.isPeriodic !== curr.isPeriodic}
                            >
                                {renderPeriodicForm}
                            </Form.Item>
                        </Form>
                        <div className="edit-room-under">
                            <Button className="edit-room-cancel" onClick={cancelSchedule}>
                                取消
                            </Button>
                            <Button
                                className="edit-room-ok"
                                onClick={() => {
                                    if (!loading && isFormVetted) {
                                        onSubmit(form.getFieldsValue(true));
                                    }
                                }}
                                loading={loading}
                                disabled={!loading && !isFormVetted}
                            >
                                {type === EditRoomType.Schedule ? "预定" : "修改"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainPageLayout>
    );

    function onToggleIsPeriodic(e: CheckboxChangeEvent): void {
        if (e.target.checked) {
            const today: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
            form.setFieldsValue({
                periodic: {
                    weeks: [getDay(today)],
                    rate: 7,
                    endTime: endOfDay(addWeeks(today, 7)),
                },
            });
        }
    }

    function cancelSchedule(): void {
        if (form.isFieldsTouched()) {
            Modal.confirm({
                content: "房间信息未保存，是否返回？",
                onOk() {
                    history.goBack();
                },
            });
        } else {
            history.goBack();
        }
    }

    function formValidateStatus(): void {
        setIsFormVetted(form.getFieldsError().every(field => field.errors.length <= 0));
    }
});

export default EditRoomPage;
