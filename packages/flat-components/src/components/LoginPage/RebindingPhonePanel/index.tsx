import "./index.less";

import { useTranslate } from "@netless/flat-i18n";
import { Button, message, Form } from "antd";
import React, { useCallback, useState } from "react";

import { useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAccount, PasswordLoginType, defaultCountryCode } from "../LoginAccount";
import { LoginSendCode } from "../LoginSendCode";
import { codeValidator } from "../LoginWithCode/validators";
import { phoneValidator } from "../LoginWithPassword/validators";

export interface RebindingPhonePanelProps {
    defaultPhone: string;
    cancelRebindingPhone: () => void;
    rebindingPhone: (countryCode: string, phone: string, code: string) => Promise<boolean>;
    sendRebindingPhoneCode: (countryCode: string, phone: string) => Promise<any>;
}

interface RebindingFormValues {
    phone: string;
    code: string;
}

export const RebindingPhonePanel: React.FC<RebindingPhonePanelProps> = ({
    defaultPhone,
    sendRebindingPhoneCode,
    rebindingPhone,
    cancelRebindingPhone,
}) => {
    const sp = useSafePromise();
    const t = useTranslate();

    const [form] = Form.useForm<RebindingFormValues>();
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [isAccountValidated, setIsAccountValidated] = useState(defaultPhone.length > 0);
    const type = PasswordLoginType.Phone;

    const defaultValues = {
        phone: defaultPhone,
        code: "",
    };

    const [countryCode, setCountryCode] = useState(defaultCountryCode);
    const [clickedRebinding, setClickedRebinding] = useState(false);

    const handleRebindingPhone = useCallback(async () => {
        if (isFormValidated && rebindingPhone) {
            setClickedRebinding(true);
            const { phone, code } = form.getFieldsValue();
            const success = await sp(rebindingPhone(countryCode, phone, code));
            if (success) {
                await sp(new Promise(resolve => setTimeout(resolve, 60000)));
            } else {
                message.error(t("rebinding-phone-failed"));
            }
            setClickedRebinding(false);
        }
    }, [isFormValidated, form, sp, countryCode, rebindingPhone, t]);

    const sendVerificationCode = async (): Promise<any> => {
        const { phone } = form.getFieldsValue();
        return sendRebindingPhoneCode(countryCode, phone);
    };

    const formValidateStatus = useCallback(() => {
        setIsFormValidated(
            form.getFieldsError().every(field => field.errors.length <= 0) &&
                Object.values(form.getFieldsValue()).every(v => !!v),
        );

        if (form.getFieldValue("phone") && !form.getFieldError("phone").length) {
            setIsAccountValidated(true);
        } else {
            setIsAccountValidated(false);
        }
    }, [form]);

    return (
        <div className="login-with-phone-rebinding">
            <div className="login-width-limiter">
                <LoginTitle subtitle=" " title={t("rebinding-phone")} />

                <Form
                    form={form}
                    initialValues={defaultValues}
                    name="rebindingPhoneForm"
                    onFieldsChange={formValidateStatus}
                >
                    <Form.Item name="phone" rules={[phoneValidator]}>
                        <LoginAccount
                            countryCode={countryCode}
                            handleCountryCode={code => setCountryCode(code)}
                            onlyPhone={true}
                            placeholder={t("enter-phone")}
                        />
                    </Form.Item>

                    <Form.Item name="code" rules={[codeValidator]}>
                        <LoginSendCode
                            isAccountValidated={isAccountValidated}
                            sendVerificationCode={sendVerificationCode}
                            type={type}
                        />
                    </Form.Item>
                </Form>
                <Button
                    className="login-big-button"
                    disabled={!isFormValidated}
                    loading={clickedRebinding}
                    type="primary"
                    onClick={handleRebindingPhone}
                >
                    {t("confirm")}
                </Button>
                <Button className="login-btn-back" type="link" onClick={cancelRebindingPhone}>
                    {t("back")}
                </Button>
            </div>
        </div>
    );
};
