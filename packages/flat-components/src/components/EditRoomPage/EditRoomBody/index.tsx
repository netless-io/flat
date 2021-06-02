import "./style.less";

import { Button, Checkbox, Form, Input, Modal } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { addWeeks, endOfDay, getDay } from "date-fns";
import React, { useMemo, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PeriodicEndType, RoomType, Week } from "../../../types/room";
import { renderBeginTimePicker } from "./renderBeginTimePicker";
import { renderEndTimePicker } from "./renderEndTimePicker";
import { renderPeriodicForm } from "./renderPeriodicForm";
import { ClassPicker } from "../../HomePage/ClassPicker";

export interface EditRoomFormValues {
    title: string;
    type: RoomType;
    isPeriodic: boolean;
    beginTime: Date;
    endTime: Date;
    periodic: {
        endType: PeriodicEndType;
        weeks: Week[];
        rate: number;
        endTime: Date;
    };
}

export type EditRoomFormInitialValues =
    | ({ isPeriodic: true } & Omit<EditRoomFormValues, "isPeriodic">)
    | ({ isPeriodic: false } & Omit<EditRoomFormValues, "periodic" | "isPeriodic"> &
          Pick<Partial<EditRoomFormValues>, "periodic">);

export type EditRoomType = "schedule" | "ordinary" | "periodic" | "periodicSub";

export interface EditRoomBodyProps {
    type: EditRoomType;
    initialValues: EditRoomFormInitialValues;
    loading: boolean;
    onSubmit: (value: EditRoomFormValues) => void;
    previousPeriodicRoomBeginTime?: number | null;
    nextPeriodicRoomEndTime?: number | null;
}

export const EditRoomBody: React.FC<EditRoomBodyProps> = ({
    type,
    initialValues,
    loading,
    onSubmit,
    previousPeriodicRoomBeginTime,
    nextPeriodicRoomEndTime,
}) => {
    const history = useHistory();

    const [isFormVetted, setIsFormVetted] = useState(true);
    const [isShowEditSubmitConfirm, showEditSubmitConfirm] = useState(false);
    const { t, i18n } = useTranslation();

    const hasInputAutoSelectedRef = useRef(false);

    const [form] = Form.useForm<EditRoomFormValues>();

    const defaultValues = useMemo<EditRoomFormValues>(() => {
        return {
            periodic: {
                endType: "rate",
                weeks: [getDay(initialValues.beginTime)],
                rate: 7,
                endTime: addWeeks(initialValues.beginTime, 6),
            },
            ...initialValues,
        };
    }, [initialValues]);

    return (
        <>
            <div className="edit-room-body fancy-scrollbar">
                <div className="edit-room-mid">
                    <Form
                        form={form}
                        layout="vertical"
                        name="createRoom"
                        initialValues={defaultValues}
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
                                disabled={type === "periodicSub"}
                                ref={input => {
                                    if (!input) {
                                        return;
                                    }
                                    // select text on next cycle so that
                                    // dom is always ready
                                    setTimeout(() => {
                                        if (hasInputAutoSelectedRef.current) {
                                            return;
                                        }
                                        if (input) {
                                            input.focus();
                                            input.select();
                                            hasInputAutoSelectedRef.current = true;
                                        }
                                    }, 0);
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="类型" name="type">
                            <ClassPicker large={true} disabled={type === "periodicSub"} />
                        </Form.Item>
                        {renderBeginTimePicker(
                            form,
                            previousPeriodicRoomBeginTime,
                            nextPeriodicRoomEndTime,
                        )}
                        {renderEndTimePicker(form, nextPeriodicRoomEndTime)}
                        {type === "schedule" ? (
                            <Form.Item name="isPeriodic" valuePropName="checked">
                                <Checkbox onChange={onToggleIsPeriodic}>
                                    <span className="edit-room-cycle">周期性房间</span>
                                </Checkbox>
                            </Form.Item>
                        ) : (
                            type === "periodic" && (
                                <div className="ant-form-item-label edit-room-form-label">
                                    周期性房间
                                </div>
                            )
                        )}
                        <Form.Item
                            noStyle
                            shouldUpdate={(prev: EditRoomFormValues, curr: EditRoomFormValues) =>
                                prev.isPeriodic !== curr.isPeriodic
                            }
                        >
                            {renderPeriodicForm(t, i18n.language)}
                        </Form.Item>
                    </Form>
                    <div className="edit-room-under">
                        <Button className="edit-room-cancel" onClick={onCancelForm}>
                            取消
                        </Button>
                        <Button
                            className="edit-room-ok"
                            onClick={async () => {
                                if (!form.isFieldsTouched() && type !== "schedule") {
                                    history.goBack();
                                } else {
                                    await form.validateFields();
                                    if (!loading && isFormVetted) {
                                        if (type === "schedule") {
                                            onSubmitForm();
                                        } else {
                                            showEditSubmitConfirm(true);
                                        }
                                    }
                                }
                            }}
                            loading={loading}
                            disabled={!loading && !isFormVetted}
                        >
                            {type === "schedule" ? "预定" : "修改"}
                        </Button>
                    </div>
                </div>
            </div>
            {type !== "schedule" && (
                <Modal
                    visible={isShowEditSubmitConfirm}
                    title={renderModalTitle(type)}
                    onCancel={hideEditSubmitConfirm}
                    onOk={onSubmitForm}
                    footer={[
                        <Button key="Cancel" onClick={hideEditSubmitConfirm}>
                            取消
                        </Button>,
                        <Button
                            key="Ok"
                            type="primary"
                            loading={loading}
                            disabled={!loading && !isFormVetted}
                            onClick={onSubmitForm}
                        >
                            确定
                        </Button>,
                    ]}
                >
                    {renderModalContent(type)}
                </Modal>
            )}
        </>
    );

    function renderModalTitle(editRoomType: EditRoomType): string {
        switch (editRoomType) {
            case "ordinary": {
                return "修改房间";
            }
            case "periodicSub": {
                return "修改本次房间";
            }
            case "periodic": {
                return "修改周期性房间";
            }
            default: {
                return "修改房间";
            }
        }
    }

    function renderModalContent(editRoomType: EditRoomType): string {
        switch (editRoomType) {
            case "ordinary": {
                return "确定修改该房间？";
            }
            case "periodicSub": {
                return "确定修改本次房间？";
            }
            case "periodic": {
                return "确定修改该系列周期性房间？";
            }
            default: {
                return "确定修改房间？";
            }
        }
    }

    function onToggleIsPeriodic(e: CheckboxChangeEvent): void {
        if (e.target.checked) {
            const today: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
            form.setFieldsValue({
                periodic: {
                    weeks: [getDay(today)],
                    rate: 7,
                    endTime: endOfDay(addWeeks(today, 6)),
                },
            });
        }
    }

    function onSubmitForm(): void {
        if (!loading && isFormVetted) {
            onSubmit(form.getFieldsValue(true));
        }
    }

    function onCancelForm(): void {
        if (form.isFieldsTouched()) {
            Modal.confirm({
                content: "房间信息未保存，确定返回？",
                onOk() {
                    history.goBack();
                },
            });
        } else {
            history.goBack();
        }
    }

    function hideEditSubmitConfirm(): void {
        showEditSubmitConfirm(false);
    }

    function formValidateStatus(): void {
        setIsFormVetted(form.getFieldsError().every(field => field.errors.length <= 0));
    }
};
