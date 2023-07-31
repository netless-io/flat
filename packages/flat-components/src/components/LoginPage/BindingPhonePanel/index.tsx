import { useTranslate } from "@netless/flat-i18n";
import { Input, Select, Button, message } from "antd";

import { validatePhone, validateCode } from "../LoginWithCode";
import { COUNTRY_CODES } from "../LoginWithCode/data";
import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";
import React, { useCallback, useState } from "react";
import { LoginTitle } from "../LoginTitle";

import checkedSVG from "../icons/checked.svg";

export interface BindingPhonePanelProps {
    cancelBindingPhone: () => void;
    bindingPhone?: (countryCode: string, phone: string, code: string) => Promise<boolean>;
    sendBindingPhoneCode?: (countryCode: string, phone: string) => Promise<boolean>;
}

export const BindingPhonePanel: React.FC<BindingPhonePanelProps> = ({
    sendBindingPhoneCode,
    cancelBindingPhone,
    bindingPhone,
}) => {
    const sp = useSafePromise();
    const t = useTranslate();

    const isUnMountRef = useIsUnMounted();
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [countryCode, setCountryCode] = useState("+86");
    const [clickedBinding, setClickedBinding] = useState(false);
    const [bindingPhoneCode, setBindingPhoneCode] = useState("");

    const canBinding = !clickedBinding && validatePhone(phone) && validateCode(bindingPhoneCode);

    const sendBindingCode = useCallback(async () => {
        if (validatePhone(phone) && sendBindingPhoneCode) {
            setCode(true);
            const sent = await sp(sendBindingPhoneCode(countryCode, phone));
            setCode(false);
            if (sent) {
                void message.info(t("sent-verify-code-to-phone"));
                let count = 60;
                setCountdown(count);
                const timer = setInterval(() => {
                    if (isUnMountRef.current) {
                        clearInterval(timer);
                        return;
                    }
                    setCountdown(--count);
                    if (count === 0) {
                        clearInterval(timer);
                    }
                }, 1000);
            }
        }
    }, [countryCode, isUnMountRef, phone, sendBindingPhoneCode, sp, t]);

    const bindPhone = useCallback(async () => {
        if (canBinding && bindingPhone) {
            setClickedBinding(true);
            const success = await sp(bindingPhone(countryCode, phone, bindingPhoneCode));
            if (success) {
                await sp(new Promise(resolve => setTimeout(resolve, 60000)));
            } else {
                message.error(t("bind-phone-failed"));
            }
            setClickedBinding(false);
        }
    }, [bindingPhone, bindingPhoneCode, canBinding, countryCode, phone, sp, t]);

    return (
        <div className="login-with-phone binding">
            <div className="login-width-limiter">
                <LoginTitle subtitle={t("need-bind-phone")} title={t("bind-phone")} />
                <Input
                    placeholder={t("enter-phone")}
                    prefix={
                        <Select bordered={false} defaultValue="+86" onChange={setCountryCode}>
                            {COUNTRY_CODES.map(code => (
                                <Select.Option
                                    key={code}
                                    value={`+${code}`}
                                >{`+${code}`}</Select.Option>
                            ))}
                        </Select>
                    }
                    size="small"
                    status={!phone || validatePhone(phone) ? undefined : "error"}
                    value={phone}
                    onChange={ev => setPhone(ev.currentTarget.value)}
                />
                <Input
                    placeholder={t("enter-code")}
                    prefix={<img alt="checked" draggable={false} src={checkedSVG} />}
                    status={
                        !bindingPhoneCode || validateCode(bindingPhoneCode) ? undefined : "error"
                    }
                    suffix={
                        countdown > 0 ? (
                            <span className="login-countdown">
                                {t("seconds-to-resend", { seconds: countdown })}
                            </span>
                        ) : (
                            <Button
                                disabled={code || !validatePhone(phone)}
                                loading={code}
                                size="small"
                                type="link"
                                onClick={sendBindingCode}
                            >
                                {t("send-verify-code")}
                            </Button>
                        )
                    }
                    value={bindingPhoneCode}
                    onChange={ev => setBindingPhoneCode(ev.currentTarget.value)}
                />
                <Button
                    className="login-big-button"
                    disabled={!canBinding}
                    loading={clickedBinding}
                    type="primary"
                    onClick={bindPhone}
                >
                    {t("confirm")}
                </Button>
                <Button className="login-btn-back" type="link" onClick={cancelBindingPhone}>
                    {t("back")}
                </Button>
            </div>
        </div>
    );
};
