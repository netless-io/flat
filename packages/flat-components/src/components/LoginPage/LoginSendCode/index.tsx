import "./index.less";

import React, { useCallback, useState } from "react";
import { Input, Button, message } from "antd";
import { useTranslate } from "@netless/flat-i18n";

import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";
import { PasswordLoginType, isPhone } from "../LoginAccount";
import checkedSVG from "../icons/checked.svg";

export interface LoginSendCodeProps {
    isAccountValidated: boolean;
    type: PasswordLoginType;
    sendVerificationCode: () => Promise<boolean>;
}

export const LoginSendCode: React.FC<LoginSendCodeProps> = ({
    type,
    isAccountValidated,
    sendVerificationCode,
    ...restProps
}) => {
    const isUnMountRef = useIsUnMounted();
    const sp = useSafePromise();
    const t = useTranslate();

    const [countdown, setCountdown] = useState(0);
    const [sendingCode, setSendingCode] = useState(false);

    const sendCode = useCallback(async () => {
        if (isAccountValidated) {
            setSendingCode(true);
            const sent = await sp(sendVerificationCode());
            setSendingCode(false);
            if (sent) {
                void message.info(
                    t(isPhone(type) ? "sent-verify-code-to-phone" : "sent-verify-code-to-email"),
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
        }
    }, [isUnMountRef, isAccountValidated, type, sendVerificationCode, sp, t]);

    return (
        <Input
            placeholder={t("enter-code")}
            prefix={<img alt="checked" draggable={false} src={checkedSVG} />}
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
