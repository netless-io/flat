import "./CreateRoomBox.less";

import React, { useContext, useEffect, useRef, useState, KeyboardEvent, useCallback } from "react";
import {
    ClassPicker,
    HomePageHeroButton,
    PmiDesc,
    PmiExistTip,
    Region,
    formatInviteCode,
} from "flat-components";
import { Input, Modal, Checkbox, Form, InputRef, Dropdown, message, Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useTranslate } from "@netless/flat-i18n";
import { RoomType } from "@netless/flat-server-api";
import { observer } from "mobx-react-lite";

import { PreferencesStoreContext, GlobalStoreContext } from "../../components/StoreProvider";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { FLAT_WEB_BASE_URL } from "../../constants/process";

interface CreateRoomFormValues {
    roomTitle: string;
    roomType: RoomType;
    autoMicOn: boolean;
    autoCameraOn: boolean;
    pmi?: boolean;
}

export interface CreateRoomBoxProps {
    onCreateRoom: (title: string, type: RoomType, region: Region, pmi?: boolean) => Promise<void>;
}

export const CreateRoomBox = observer<CreateRoomBoxProps>(function CreateRoomBox({ onCreateRoom }) {
    const t = useTranslate();
    const sp = useSafePromise();
    const globalStore = useContext(GlobalStoreContext);
    const preferencesStore = useContext(PreferencesStoreContext);
    const pushHistory = usePushHistory();

    const [form] = Form.useForm<CreateRoomFormValues>();

    const [isLoading, setLoading] = useState(false);
    const [isShowModal, showModal] = useState(false);
    const [isFormValidated, setIsFormValidated] = useState(false);

    // @TODO: need to remove region from preferences store
    const [roomRegion] = useState<Region>(preferencesStore.getRegion());

    const [classType, setClassType] = useState<RoomType>(RoomType.BigClass);
    const roomTitleInputRef = useRef<InputRef>(null);

    const defaultValues: CreateRoomFormValues = {
        roomTitle: globalStore.userInfo?.name
            ? t("create-room-default-title", { name: globalStore.userInfo.name })
            : "",
        roomType: RoomType.BigClass,
        autoMicOn: preferencesStore.autoMicOn,
        autoCameraOn: preferencesStore.autoCameraOn,
        // if there exists pmi room, it can not be selected
        pmi: preferencesStore.autoPmiOn && !globalStore.pmiRoomExist,
    };

    useEffect(() => {
        const checkPmi = (): void => {
            if (!globalStore.pmi) {
                globalStore.updatePmi();
            }
        };

        checkPmi();
    }, [globalStore]);

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

    const handleCopy = useCallback(
        (text: string) => {
            const copyText =
                t("pmi-invite-prefix", {
                    userName: globalStore.userInfo?.name,
                }) +
                "\n" +
                "\n" +
                t("invite-suffix", { uuid: formatInviteCode("", text) }) +
                "\n" +
                "\n" +
                t("invite-join-link", { link: `${FLAT_WEB_BASE_URL}/join/${text}` });

            navigator.clipboard.writeText(copyText);
            void message.success(t("copy-success"));
        },
        [globalStore.userInfo?.name, t],
    );

    const handleCreateRoom = (): void => {
        if (preferencesStore.autoPmiOn && globalStore.pmiRoomExist) {
            // enter room directly
            onJoinRoom(globalStore.pmiRoomUUID);
        } else {
            form.setFieldsValue(defaultValues);
            showModal(true);
            formValidateStatus();
        }
    };

    const onJoinRoom = async (roomUUID: string): Promise<void> => {
        if (globalStore.isTurnOffDeviceTest || window.isElectron) {
            await joinRoomHandler(roomUUID, pushHistory);
        } else {
            pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
        }
    };

    return (
        <>
            <HomePageHeroButton type="begin" onClick={handleCreateRoom}>
                {!!globalStore.pmi && (
                    <Dropdown
                        overlay={
                            <div
                                className="pmi-selector-content"
                                onClick={e => {
                                    e.stopPropagation();
                                }}
                            >
                                <Checkbox
                                    checked={preferencesStore.autoPmiOn}
                                    className="pmi-selector-item"
                                    onClick={() =>
                                        preferencesStore.updateAutoPmiOn(
                                            !preferencesStore.autoPmiOn,
                                        )
                                    }
                                >
                                    <PmiDesc
                                        className="checkbox-item-inner"
                                        pmi={globalStore.pmi}
                                        text={t("turn-on-the-pmi")}
                                    />
                                </Checkbox>
                                <Button
                                    key="copy"
                                    className="pmi-selector-item"
                                    type="link"
                                    onClick={() => handleCopy(globalStore.pmi!)}
                                >
                                    {t("copy-pmi")}
                                </Button>
                            </div>
                        }
                        overlayClassName="pmi-selector"
                        trigger={["hover"]}
                    >
                        <div className="pmi-selector-more" onClick={e => e.stopPropagation()}>
                            <MoreOutlined />
                        </div>
                    </Dropdown>
                )}
            </HomePageHeroButton>
            <Modal
                forceRender // make "form" usable
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        {t("cancel")}
                    </Button>,
                    <Button
                        key="submit"
                        disabled={!isFormValidated}
                        loading={isLoading}
                        type="primary"
                        onClick={handleOk}
                    >
                        {t("begin")}
                    </Button>,
                ]}
                open={isShowModal}
                title={t("home-page-hero-button-type.begin")}
                width={400}
                wrapClassName="create-room-box-container"
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
                        label={t("theme")}
                        name="roomTitle"
                        rules={[
                            { required: true, message: t("enter-room-theme") },
                            { max: 50, message: t("theme-can-be-up-to-50-characters") },
                        ]}
                    >
                        <Input
                            ref={roomTitleInputRef}
                            placeholder={t("enter-room-theme")}
                            onKeyUp={submitOnEnter}
                        />
                    </Form.Item>
                    <Form.Item label={t("type")} name="roomType" valuePropName="type">
                        <ClassPicker value={classType} onChange={e => setClassType(RoomType[e])} />
                    </Form.Item>
                    <Form.Item label={t("join-options")}>
                        <Form.Item noStyle name="autoMicOn" valuePropName="checked">
                            <Checkbox>{t("turn-on-the-microphone")}</Checkbox>
                        </Form.Item>
                        <Form.Item noStyle name="autoCameraOn" valuePropName="checked">
                            <Checkbox>{t("turn-on-the-camera")}</Checkbox>
                        </Form.Item>
                        {globalStore.pmi && (
                            <Form.Item
                                className="main-room-menu-form-item no-margin pmi"
                                name="pmi"
                                valuePropName="checked"
                            >
                                <Checkbox
                                    checked={preferencesStore.autoPmiOn}
                                    disabled={globalStore.pmiRoomExist}
                                    onClick={() =>
                                        preferencesStore.updateAutoPmiOn(
                                            !preferencesStore.autoPmiOn,
                                        )
                                    }
                                >
                                    <PmiDesc
                                        className="checkbox-item-inner"
                                        pmi={globalStore.pmi}
                                        text={t("turn-on-the-pmi")}
                                    />
                                </Checkbox>
                                {globalStore.pmiRoomExist && <PmiExistTip />}
                            </Form.Item>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );

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
            preferencesStore.updateAutoCameraOn(values.autoCameraOn);
            await sp(onCreateRoom(values.roomTitle, values.roomType, roomRegion, values.pmi));
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
});

export default CreateRoomBox;
