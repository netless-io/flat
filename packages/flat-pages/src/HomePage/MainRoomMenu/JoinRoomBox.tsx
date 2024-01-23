import "./JoinRoomBox.less";

import React, { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, Checkbox, Form, InputRef, Dropdown, Menu } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { HomePageHeroButton, SVGChevronDown, formatInviteCode } from "flat-components";
import { GlobalStoreContext, PreferencesStoreContext } from "../../components/StoreProvider";
import { useSafePromise } from "../../utils/hooks/lifecycle";

interface JoinRoomFormValues {
    roomUUID: string;
    autoCameraOn: boolean;
    autoMicOn: boolean;
}

export interface JoinRoomBoxProps {
    onJoinRoom: (roomUUID: string) => Promise<void>;
}

const ROOM_UUID_RE =
    /(?:[A-Z]{2}-)?(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)/i;

const INVITE_CODE_RE = /[0-9]{3,4} [0-9]{3} [0-9]{4}/;

export const JoinRoomBox = observer<JoinRoomBoxProps>(function JoinRoomBox({ onJoinRoom }) {
    const t = useTranslate();
    const sp = useSafePromise();
    const preferencesStore = useContext(PreferencesStoreContext);
    const globalStore = useContext(GlobalStoreContext);
    const [form] = Form.useForm<JoinRoomFormValues>();

    const [isLoading, setLoading] = useState(false);
    const [isShowModal, showModal] = useState(false);
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [dropdown, showDropdown] = useState(false);
    const roomTitleInputRef = useRef<InputRef>(null);

    useEffect(() => {
        let ticket = NaN;
        if (isShowModal) {
            // wait a cycle till antd modal updated
            ticket = window.setTimeout(() => {
                if (roomTitleInputRef.current) {
                    roomTitleInputRef.current.focus();
                    roomTitleInputRef.current.select();
                }
            }, 0);
        }
        return () => {
            window.clearTimeout(ticket);
        };
    }, [isShowModal]);

    const defaultValues: JoinRoomFormValues = {
        roomUUID: "",
        autoCameraOn: preferencesStore.autoCameraOn,
        autoMicOn: preferencesStore.autoMicOn,
    };

    return (
        <>
            <HomePageHeroButton type="join" onClick={handleShowModal} />
            <Modal
                cancelText={t("cancel")}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        {t("cancel")}
                    </Button>,
                    <Button
                        key="submit"
                        disabled={!isFormValidated || form.getFieldValue("roomUUID").trim() === ""}
                        loading={isLoading}
                        type="primary"
                        onClick={handleOk}
                    >
                        {t("join")}
                    </Button>,
                ]}
                okText={t("join")}
                open={isShowModal}
                title={t("home-page-hero-button-type.join")}
                width={400}
                wrapClassName="join-room-box-container"
                onCancel={handleCancel}
                onOk={handleOk}
            >
                <Form
                    className="main-room-menu-form"
                    form={form}
                    initialValues={defaultValues}
                    layout="vertical"
                    name="createRoom"
                    onFieldsChange={formValidateStatus}
                >
                    <Form.Item
                        label={t("room-uuid")}
                        name="roomUUID"
                        rules={[{ required: true, message: t("enter-room-uuid") }]}
                    >
                        <Input
                            ref={roomTitleInputRef}
                            autoComplete="off"
                            placeholder={t("enter-room-uuid")}
                            suffix={
                                globalStore.roomHistory.length > 0 && (
                                    <Dropdown
                                        open={dropdown}
                                        overlay={
                                            <Menu
                                                className="join-room-box-dropdown-menu"
                                                items={globalStore.roomHistory.map(room => ({
                                                    key: room.uuid,
                                                    label: (
                                                        <>
                                                            <span className="room-title">
                                                                {room.title}
                                                            </span>
                                                            <span className="invite-code">
                                                                {formatInviteCode("", room.uuid)}
                                                            </span>
                                                        </>
                                                    ),
                                                }))}
                                                onClick={e => selectRoomFromHistory(e.key)}
                                            />
                                        }
                                        overlayClassName="join-room-box-dropdown"
                                    >
                                        <Button
                                            size="small"
                                            type="text"
                                            onClick={() => showDropdown(e => !e)}
                                        >
                                            <SVGChevronDown active={dropdown} />
                                        </Button>
                                    </Dropdown>
                                )
                            }
                            onKeyUp={submitOnEnter}
                        />
                    </Form.Item>
                    <Form.Item label={t("join-options")}>
                        <Form.Item noStyle name="autoMicOn" valuePropName="checked">
                            <Checkbox>{t("turn-on-the-microphone")}</Checkbox>
                        </Form.Item>
                        <Form.Item noStyle name="autoCameraOn" valuePropName="checked">
                            <Checkbox>{t("turn-on-the-camera")}</Checkbox>
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );

    async function extractUUIDFromClipboard(): Promise<string | undefined> {
        const text = await navigator.clipboard.readText();
        const m = ROOM_UUID_RE.exec(text);
        if (m) {
            return m[0];
        }
        const m2 = INVITE_CODE_RE.exec(text);
        return m2?.[0];
    }

    async function handleShowModal(): Promise<void> {
        try {
            const roomUUID = await extractUUIDFromClipboard();
            if (roomUUID) {
                form.setFieldsValue({ roomUUID });
                setIsFormValidated(true);
            }
        } catch {
            // ignore
        }
        showModal(true);
    }

    function submitOnEnter(ev: KeyboardEvent<HTMLInputElement>): void {
        if (ev.key === "Enter" && !ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
            ev.preventDefault();
            sp(form.validateFields()).then(handleOk);
        }
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
            preferencesStore.updateAutoMicOn(values.autoMicOn);
            preferencesStore.updateAutoCameraOn(values.autoCameraOn);
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
        const values = form.getFieldsValue();
        preferencesStore.updateAutoMicOn(values.autoMicOn);
        preferencesStore.updateAutoCameraOn(values.autoCameraOn);
    }

    function selectRoomFromHistory(uuid: string): void {
        form.setFieldValue("roomUUID", formatInviteCode("", uuid));
        showDropdown(false);
        void form.validateFields();
    }
});
