import joinSVG from "../../../assets/image/join.svg";

import React, { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, Checkbox, Form } from "antd";
import { validate, version } from "uuid";
import { ConfigStoreContext, GlobalStoreContext } from "../../../components/StoreProvider";
import { useSafePromise } from "../../../utils/hooks/lifecycle";

interface JoinRoomFormValues {
    roomUUID: string;
    autoCameraOn: boolean;
    autoMicOn: boolean;
}

export interface JoinRoomBoxProps {
    onJoinRoom: (roomUUID: string) => Promise<void>;
}

export const JoinRoomBox = observer<JoinRoomBoxProps>(function JoinRoomBox({ onJoinRoom }) {
    const sp = useSafePromise();
    const globalStore = useContext(GlobalStoreContext);
    const configStore = useContext(ConfigStoreContext);
    const [form] = Form.useForm<JoinRoomFormValues>();

    const [isLoading, setLoading] = useState(false);
    const [isShowModal, showModal] = useState(false);
    const [isFormValidated, setIsFormValidated] = useState(false);

    const defaultValues: JoinRoomFormValues = {
        roomUUID: "",
        autoCameraOn: configStore.autoCameraOn,
        autoMicOn: configStore.autoMicOn,
    };

    // const historyMenu = (
    //     <Menu className="modal-menu-item">
    //         {/* {// @TODO add join room history
    // joinRoomHistories.map(room => (
    //     <Menu.Item key={room.uuid}>{room.name || room.uuid}</Menu.Item>
    // ))} */}
    //         <Menu.Divider />
    //         <Button className="modal-inner-select" type="link">
    //             清空记录
    //         </Button>
    //     </Menu>
    // );

    return (
        <>
            <Button onClick={handleShowModal}>
                <img src={joinSVG} alt="join room" />
                <span className="label">加入房间</span>
            </Button>
            <Modal
                title="加入房间"
                width={368}
                visible={isShowModal}
                okText={"加入"}
                cancelText={"取消"}
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
                        disabled={!isFormValidated}
                    >
                        加入
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
                        name="roomUUID"
                        label="房间号"
                        rules={[{ required: true, message: "请输入房间号" }]}
                    >
                        <Input
                            placeholder="请输入房间号"
                            // suffix={
                            //     <Dropdown
                            //         trigger={["click"]}
                            //         placement="bottomRight"
                            //         overlay={historyMenu}
                            //     >
                            //         <img
                            //             className="modal-dropdown-icon"
                            //             src={dropdownSVG}
                            //             alt={"dropdown"}
                            //         />
                            //     </Dropdown>
                            // }
                        />
                    </Form.Item>
                    <Form.Item label="昵称">
                        <Input disabled value={globalStore.wechat?.name} />
                    </Form.Item>
                    <Form.Item label="加入选项">
                        <Form.Item name="autoMicOn" noStyle valuePropName="checked">
                            <Checkbox>开启麦克风</Checkbox>
                        </Form.Item>
                        <Form.Item name="autoCameraOn" noStyle valuePropName="checked">
                            <Checkbox>开启摄像头</Checkbox>
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );

    async function handleShowModal(): Promise<void> {
        try {
            const roomUUID = await navigator.clipboard.readText();
            if (validate(roomUUID) && version(roomUUID) === 4) {
                form.setFieldsValue({ roomUUID });
                setIsFormValidated(true);
            }
        } catch {
            // ignore
        }
        showModal(true);
    }

    async function handleOk(): Promise<void> {
        try {
            await sp(form.validateFields());
        } catch (e) {
            // errors are displayed on the form
            return;
        }

        setLoading(true);

        try {
            const values = form.getFieldsValue();
            configStore.updateAutoMicOn(values.autoMicOn);
            configStore.updateAutoCameraOn(values.autoCameraOn);
            await sp(onJoinRoom(values.roomUUID));
            setLoading(false);
            showModal(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }

    function handleCancel(): void {
        showModal(false);
    }

    function formValidateStatus(): void {
        setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
    }
});
