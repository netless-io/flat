import "./index.less";

import React, { useCallback, useEffect, useState } from "react";
import { Input, Button, message } from "antd";
import { useTranslate } from "@netless/flat-i18n";

import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";
import { PasswordLoginType, isPhone } from "../LoginAccount";
import checkedSVG from "../icons/checked.svg";
import { BindingPhoneSendCodeResult, RequestErrorCode } from "@netless/flat-server-api";
import { errorTips } from "../../../utils/errorTip";

export interface LoginSendCodeProps {
    isAccountValidated: boolean;
    type: PasswordLoginType;
    // BindingPhoneSendCodeResult for binding phone page
    sendVerificationCode: () => Promise<boolean | BindingPhoneSendCodeResult>;
    // for rebinding phone
    onRebinding?: () => void;
}

export const LoginSendCode: React.FC<LoginSendCodeProps> = ({
    type,
    isAccountValidated,
    sendVerificationCode,
    onRebinding,
    ...restProps
}) => {
    const isUnMountRef = useIsUnMounted();
    const sp = useSafePromise();
    const t = useTranslate();

    const [countdown, setCountdown] = useState(0);
    const [sendingCode, setSendingCode] = useState(false);

    const sendCode = useCallback(async () => {
        if (isAccountValidated) {
            try {
                setSendingCode(true);
                const sent = await sp(sendVerificationCode());
                setSendingCode(false);

                if (sent) {
                    void message.info(
                        t(
                            isPhone(type)
                                ? "sent-verify-code-to-phone"
                                : "sent-verify-code-to-email",
                        ),
                    );
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
                } else {
                    message.error(t("send-verify-code-failed"));
                }
            } catch (error) {
                if (!isUnMountRef.current) {
                    setSendingCode(false);
                }

                // we say the phone is already binding when error message contains `RequestErrorCode.SMSAlreadyBinding`
                // and then we can enter rebinding page to rebind.
                if (error.message.indexOf(RequestErrorCode.SMSAlreadyBinding) > -1 && onRebinding) {
                    onRebinding();
                    return;
                }

                errorTips(error);
            }
        }
    }, [isAccountValidated, sp, sendVerificationCode, t, type, isUnMountRef, onRebinding]);

    // Workaround to prevent browser auto complete this field
    // however, it still cannot prevent auto complete panel from showing up
    const [readOnly, setReadOnly] = useState(true);
    useEffect(() => {
        const ticket = setTimeout(() => {
            setReadOnly(false);
        }, 1000);
        return () => clearTimeout(ticket);
    }, []);

    return (
        <Input
            autoComplete="off"
            placeholder={t("enter-code")}
            prefix={<img alt="checked" draggable={false} src={checkedSVG} />}
            readOnly={readOnly}
            suffix={
                countdown > 0 ? (
                    <span className="login-countdown">
                        {t("seconds-to-resend", { seconds: countdown })}
                    </span>
                ) : (
                    <Button
                        disabled={sendingCode || !isAccountValidated}
                        loading={sendingCode}
                        size="small"
                        type="link"
                        onClick={sendCode}
                    >
                        {t("send-verify-code")}
                    </Button>
                )
            }
            {...restProps}
        />
    );
};
