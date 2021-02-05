import createSVG from "../../../assets/image/creat.svg";

import React, { useContext, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, Checkbox, Form, message } from "antd";
import { RoomType } from "../../../apiMiddleware/flatServer/constants";
import { RoomTypeSelect } from "../../../components/RoomType";
import { ConfigStoreContext, GlobalStoreContext } from "../../../components/StoreProvider";

interface CreateRoomFormValues {
    roomTitle: string;
    roomType: RoomType;
    autoCameraOn: boolean;
}

export interface CreateRoomBoxProps {
    onCreateRoom: (title: string, type: RoomType) => Promise<void>;
}

export const CreateRoomBox = observer<CreateRoomBoxProps>(function CreateRoomBox({ onCreateRoom }) {
    const globalStore = useContext(GlobalStoreContext);
    const configStore = useContext(ConfigStoreContext);
    const [form] = Form.useForm<CreateRoomFormValues>();

    const [isLoading, setLoading] = useState(false);
    const [isShowModal, showModal] = useState(false);
    const [isFormValidated, setIsFormValidated] = useState(false);
    const hasInputAutoSelectedRef = useRef(false);

    const defaultValues: CreateRoomFormValues = {
        roomTitle: globalStore.wechat?.name ? `${globalStore.wechat.name}创建的房间` : "",
        roomType: RoomType.BigClass,
        autoCameraOn: configStore.autoCameraOn,
    };

    return (
        <>
            <Button
                onClick={() => {
                    form.setFieldsValue(defaultValues);
                    showModal(true);
                    formValidateStatus();
                }}
            >
                <img src={createSVG} alt="create room" />
                创建房间
            </Button>
            <Modal
                title="创建房间"
                width={368}
                visible={isShowModal}
                destroyOnClose
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={isLoading}
                        onClick={handleOk}
                        disabled={isLoading || !isFormValidated}
                    >
                        创建
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="createRoom"
                    className="main-room-menu-form"
                    initialValues={defaultValues}
                    onFieldsChange={formValidateStatus}
                >
                    <Form.Item
                        name="roomTitle"
                        label="主题"
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
                    <Form.Item name="roomType" label="类型">
                        <RoomTypeSelect />
                    </Form.Item>
                    <Form.Item label="加入选项">
                        <Form.Item name="autoCameraOn" noStyle valuePropName="checked">
                            <Checkbox>开启摄像头</Checkbox>
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );

    async function handleOk(): Promise<void> {
        try {
            await form.validateFields();
        } catch (e) {
            // errors are showed on form
            return;
        }

        setLoading(true);

        try {
            const values = form.getFieldsValue();
            configStore.updateAutoCameraOn(values.autoCameraOn);
            await onCreateRoom(values.roomTitle, values.roomType);
        } catch (e) {
            message.error(e.message);
            console.error(e);
            setLoading(false);
            showModal(false);
        }
    }

    function handleCancel(): void {
        showModal(false);
    }

    function formValidateStatus(): void {
        setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
    }
});

export default CreateRoomBox;
