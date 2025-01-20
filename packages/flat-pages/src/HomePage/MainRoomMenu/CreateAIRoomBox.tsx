import "./CreateRoomBox.less";
import React, { useContext, useEffect, useState } from "react";
import { HomePageHeroButton, Region, errorTips } from "flat-components";
import { Modal, Form, Button, Radio } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { observer } from "mobx-react-lite";

import { PreferencesStoreContext, GlobalStoreContext } from "../../components/StoreProvider";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { AITeacherLanguages, AITeacherRoles, AITeacherScenes } from "./icons/constants";
import { AILanguage, AIRole, AIScene, RoomType } from "@netless/flat-server-api";

interface CreateAIRoomFormValues {
    role: AIRole;
    scene: AIScene;
    language: AILanguage;
    autoMicOn: boolean;
    autoCameraOn: boolean;
}

export interface CreateRoomBoxProps {
    onCreateRoom: (
        title: string,
        type: RoomType,
        region: Region,
        role: AIRole,
        scene: AIScene,
        language: AILanguage,
    ) => Promise<void>;
}

interface AiTeacherItemProps {
    roles?: Array<{ icon: string; title: string; key: string }>;
    value: string;
    onChange: (value: string) => void;
}

export const AITeacherRolesSelect: React.FC<AiTeacherItemProps> = (props: AiTeacherItemProps) => {
    const { value, onChange, roles } = props;
    const t = useTranslate();
    if (!roles) {
        return null;
    }
    return (
        <div className="ai-teacher-roles">
            {roles.map((role, index) => (
                <div
                    key={index}
                    className={`ai-teacher-role-item ${value === role.key ? "selected" : ""}`}
                    onClick={() => onChange(role.key)}
                >
                    <img alt={t(role.title)} src={role.icon} />
                    <span style={{ marginTop: 5 }}>{t(role.title)}</span>
                </div>
            ))}
        </div>
    );
};

export const AITeacherSecensSelect: React.FC<AiTeacherItemProps> = (props: AiTeacherItemProps) => {
    const { value, onChange } = props;
    const t = useTranslate();
    return (
        <div className="ai-teacher-scene">
            {AITeacherScenes.map((scene, index) => (
                <div
                    key={index}
                    className={`ai-teacher-scene-item ${value === scene.key ? "selected" : ""}`}
                    style={{ backgroundColor: scene.color }}
                    onClick={() => onChange(scene.key)}
                >
                    <img alt={t(scene.title)} src={scene.icon} />
                    <span style={{ marginTop: 5 }}>{t(scene.title)}</span>
                </div>
            ))}
        </div>
    );
};

export const AITeacherLanguagesSelect: React.FC<AiTeacherItemProps> = (
    props: AiTeacherItemProps,
) => {
    const { value, onChange } = props;
    const t = useTranslate();
    return (
        <Radio.Group
            className={"ai-teacher-language-container"}
            defaultValue={value}
            onChange={e => onChange(e.target.value)}
        >
            <Radio className={"ai-teacher-language-item-box"} value={AITeacherLanguages[0].key}>
                <div className="ai-teacher-language-item">
                    <img
                        className="ai-teacher-language-item-icon"
                        src={AITeacherLanguages[0].icon}
                    />
                    <span className="ai-teacher-language-item-title">
                        {t(AITeacherLanguages[0].title)}
                    </span>
                </div>
            </Radio>
            <Radio className={"ai-teacher-language-item-box"} value={AITeacherLanguages[1].key}>
                <div className="ai-teacher-language-item">
                    <img
                        className="ai-teacher-language-item-icon"
                        src={AITeacherLanguages[1].icon}
                    />
                    <span className="ai-teacher-language-item-title">
                        {t(AITeacherLanguages[1].title)}
                    </span>
                </div>
            </Radio>
        </Radio.Group>
    );
};

export const CreateAIRoomBox = observer<CreateRoomBoxProps>(function CreateRoomBox({
    onCreateRoom,
}) {
    const t = useTranslate();
    const sp = useSafePromise();
    const globalStore = useContext(GlobalStoreContext);
    const preferencesStore = useContext(PreferencesStoreContext);

    const [form] = Form.useForm<CreateAIRoomFormValues>();
    /** loading 0 = false, 1 = jump btn loading, 2 = ok btn loading */
    const [loading, setLoading] = useState(0);
    const [isShowModal, showModal] = useState(false);
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [role, setRole] = useState(AITeacherRoles[0].key);
    // const [scene, setSecen] = useState(AITeacherScenes[0].key);
    const [language, setLanguage] = useState(AITeacherLanguages[0].key);
    const [roomRegion] = useState<Region>(preferencesStore.getRegion());
    const [curAITeacherRoles, setAITeacherRoles] = useState(AITeacherRoles);

    const defaultValues: CreateAIRoomFormValues = {
        role: curAITeacherRoles[0].key as AIRole,
        scene: "",
        language: AITeacherLanguages[0].key as AILanguage,
        autoMicOn: true,
        autoCameraOn: false,
    };

    useEffect(() => {
        if (!globalStore.pmi) {
            globalStore.updatePmi();
        }
    }, [globalStore]);

    useEffect(() => {
        if (language === AITeacherLanguages[1].key) {
            setAITeacherRoles(AITeacherRoles.filter(role => role.key === "lily"));
            form.setFieldsValue({
                role: "lily",
            });
            setRole("lily");
        } else {
            setAITeacherRoles(AITeacherRoles);
        }
    }, [language]);

    const handleCreateRoom = (): void => {
        form.setFieldsValue(defaultValues);
        showModal(true);
        formValidateStatus();
    };

    return (
        <>
            <HomePageHeroButton type="aiTeacher" onClick={handleCreateRoom}></HomePageHeroButton>
            <Modal
                forceRender // make "form" usable
                footer={[
                    <Button
                        key="jump"
                        disabled={loading === 2}
                        loading={loading === 1}
                        onClick={handleDefault}
                    >
                        {t("home-page-AI-teacher-modal.button.jump")}
                    </Button>,
                    <Button
                        key="submit"
                        disabled={!isFormValidated || loading === 1}
                        loading={loading === 2}
                        type="primary"
                        onClick={handleOk}
                    >
                        {t("begin")}
                    </Button>,
                ]}
                open={isShowModal}
                title={t("home-page-AI-teacher-modal.title")}
                width={515}
                wrapClassName="create-room-box-container"
                onCancel={handleCancel}
                onOk={handleOk}
            >
                <Form
                    className="main-room-menu-form"
                    form={form}
                    initialValues={defaultValues}
                    layout="vertical"
                    name="createAIRoom"
                    onFieldsChange={formValidateStatus}
                >
                    <Form.Item
                        label={t("home-page-AI-teacher-modal.role")}
                        name="role"
                        required={true}
                    >
                        <AITeacherRolesSelect
                            roles={curAITeacherRoles}
                            value={role}
                            onChange={e => setRole(e)}
                        />
                    </Form.Item>
                    {/* <Form.Item label={t("home-page-AI-teacher-modal.scene")} name="scene">
                        <AITeacherSecensSelect value={scene} onChange={e => setSecen(e)} />
                    </Form.Item> */}
                    <Form.Item
                        label={t("home-page-AI-teacher-modal.language")}
                        name="language"
                        required={true}
                    >
                        <AITeacherLanguagesSelect value={language} onChange={e => setLanguage(e)} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
    async function handleDefault(): Promise<void> {
        setLoading(1);

        try {
            preferencesStore.updateAutoCameraOn(defaultValues.autoCameraOn);
            const role = AITeacherRoles[0].key as AIRole;
            const language = AITeacherLanguages[0].key as AILanguage;
            const title = `AITeacher-${role}-${language}`;
            await sp(onCreateRoom(title, RoomType.OneToOne, roomRegion, role, "", language));
            setLoading(0);
            showModal(false);
        } catch (e) {
            console.error(e);
            errorTips(e);
            setLoading(0);
        }
    }

    async function handleOk(): Promise<void> {
        try {
            await sp(form.validateFields());
        } catch (e) {
            // errors are displayed on the form
            return;
        }

        setLoading(2);

        try {
            const values = form.getFieldsValue();
            preferencesStore.updateAutoCameraOn(values.autoCameraOn);
            const title = `AITeacher-${role}-${language}`;
            // if (scene) {
            //     title += `-${scene}`;
            // }
            await sp(
                onCreateRoom(
                    title,
                    RoomType.OneToOne,
                    roomRegion,
                    values.role,
                    values.scene,
                    values.language,
                ),
            );
            setLoading(0);
            showModal(false);
        } catch (e) {
            console.error(e);
            errorTips(e);
            setLoading(0);
        }
    }

    function handleCancel(): void {
        showModal(false);
    }

    function formValidateStatus(): void {
        setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
        preferencesStore.updateAutoMicOn(defaultValues.autoMicOn);
        preferencesStore.updateAutoCameraOn(defaultValues.autoCameraOn);
    }
});

export default CreateAIRoomBox;
