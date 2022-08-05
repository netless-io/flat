import React, { FC, useEffect, useState, useRef } from "react";
import { Form, Modal, Input, Select, message, FormInstance } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { CloudStorageStore } from "./store";
import { useSafePromise } from "../../utils/hooks";

interface FormValues {
    fileName: string;
    fileURL: string;
}

export interface CloudStorageExternalFilePanelProps {
    store: CloudStorageStore;
    visible: boolean;
    onClose: () => void;
}

const SUPPORTED_EXTERNAL_FILES = [".vf"];

export const CloudStorageExternalFilePanel: FC<CloudStorageExternalFilePanelProps> = ({
    store,
    visible,
    onClose,
}) => {
    const t = useTranslate();

    const formRef = useRef<FormInstance>(null);

    const sp = useSafePromise();
    const [isLoading, setLoading] = useState(false);
    const [fileExt, setFileExt] = useState(SUPPORTED_EXTERNAL_FILES[0]);

    const onSubmit = async (values: FormValues): Promise<void> => {
        if (values && values.fileName && values.fileURL) {
            setLoading(true);
            try {
                await sp(store.addExternalFile(values.fileName + fileExt, values.fileURL));
            } catch (e) {
                console.error(e);
                void message.error(t("upload-fail"));
            }
            setLoading(false);
            onClose();
        }
    };

    useEffect(() => {
        if (!visible) {
            setLoading(false);
            formRef.current?.resetFields();
        }
    }, [visible]);

    return (
        <Modal
            confirmLoading={isLoading}
            title={t("online-h5.add")}
            visible={visible}
            onCancel={onClose}
            onOk={async () => {
                if (formRef.current) {
                    try {
                        await sp(formRef.current.validateFields());
                        formRef.current.submit();
                    } catch {
                        // errors are shown on pages directly
                    }
                }
            }}
        >
            <Form
                ref={formRef}
                autoComplete="off"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                onFinish={onSubmit}
                onFinishFailed={() => {
                    void message.error(t("upload-fail"));
                    onClose();
                }}
            >
                <Form.Item
                    label={t("online-h5.name")}
                    name="fileName"
                    rules={[{ required: true, message: "Please input filename", min: 1, max: 128 }]}
                >
                    <Input
                        addonAfter={
                            <Select value={fileExt} onChange={setFileExt}>
                                {SUPPORTED_EXTERNAL_FILES.map(ext => (
                                    <Select.Option key={ext} value={ext}>
                                        {ext}
                                    </Select.Option>
                                ))}
                            </Select>
                        }
                    />
                </Form.Item>
                <Form.Item
                    label={t("online-h5.url")}
                    name="fileURL"
                    rules={[{ required: true, type: "url" }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};
