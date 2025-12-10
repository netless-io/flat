import "./index.less";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input, Button, message } from "antd";
import { useTranslate } from "@netless/flat-i18n";

import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";
import { PasswordLoginType, isPhone } from "../LoginAccount";
import checkedSVG from "../icons/checked.svg";
import {
    BindingPhoneSendCodeResult,
    FLAT_WEB_SCENE_ID,
    RequestErrorCode,
} from "@netless/flat-server-api";
import { errorTips } from "../../../utils/errorTip";

export interface LoginSendCodeProps {
    isCaptcha: boolean;
    isAccountValidated: boolean;
    type: PasswordLoginType;
    // BindingPhoneSendCodeResult for binding phone page
    sendVerificationCode: (
        captchaVerifyParam?: string,
    ) => Promise<boolean | BindingPhoneSendCodeResult>;
    // for rebinding phone
    onRebinding?: () => void;
}

export const LoginSendCode: React.FC<LoginSendCodeProps> = ({
    isCaptcha = false,
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
    const captchaRef = useRef<any>(null);
    const captchaVerifyParam = useRef<string | undefined>(undefined);
    const isAccountValidatedRef = useRef(isAccountValidated);
    const initCaptchaRef = useRef<((_isCaptcha: boolean) => void) | null>(null);

    // 保持 ref 与 prop 同步
    useEffect(() => {
        isAccountValidatedRef.current = isAccountValidated;
    }, [isAccountValidated]);

    const sendCode = useCallback(async () => {
        if (isAccountValidatedRef.current) {
            try {
                setSendingCode(true);
                const sent = await sp(sendVerificationCode(captchaVerifyParam.current));
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
                            initCaptcha(isCaptcha);
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
    }, [sp, sendVerificationCode, t, type, isUnMountRef, onRebinding]);

    const getInstance = (instance: any): void => {
        captchaRef.current = instance;
    };

    const success = useCallback(
        async (_captchaVerifyParam: string): Promise<void> => {
            captchaVerifyParam.current = _captchaVerifyParam;
            sendCode();
        },
        [sendCode],
    );

    // 验证码验证不通过回调函数
    const fail = useCallback(
        (error: any) => {
            console.error(error);
            if (initCaptchaRef.current) {
                initCaptchaRef.current(isCaptcha);
            }
        },
        [isCaptcha],
    );

    const initCaptcha = useCallback(
        (_isCaptcha: boolean) => {
            if (_isCaptcha && (window as any).initAliyunCaptcha) {
                const region = process.env.FLAT_REGION || "CN";
                (window as any).initAliyunCaptcha({
                    SceneId: FLAT_WEB_SCENE_ID || "nypf9bgg", // 场景ID。根据步骤二新建验证场景后，您可以在验证码场景列表，获取该场景的场景ID
                    mode: "popup", // 验证码模式。popup表示要集成的验证码模式为弹出式。无需修改
                    element: "#captcha-element", // 页面上预留的渲染验证码的元素，与原代码中预留的页面元素保持一致。
                    button: "#send-verify-code-phone", // 触发验证码弹窗的元素。
                    success: success,
                    fail: fail,
                    getInstance: getInstance, // 绑定验证码实例函数，无需修改
                    slideStyle: {
                        width: 360,
                        height: 40,
                    }, // 滑块验证码样式，支持自定义宽度和高度，单位为px。其中，width最小值为320 px
                    language: region === "CN" ? "cn" : "en", // 验证码语言类型，支持简体中文（cn）、繁体中文（tw）、英文（en）
                });
            } else {
                document
                    .getElementById("send-verify-code-email")
                    ?.addEventListener("click", sendCode);
            }
        },
        [success, fail, sendCode],
    );

    // 更新 ref，以便 fail 回调可以访问
    useEffect(() => {
        initCaptchaRef.current = initCaptcha;
    }, [initCaptcha]);

    const verifyBtnClick = useCallback(() => {
        if (type === PasswordLoginType.Email) {
            sendCode();
        } else if (isCaptcha && type === PasswordLoginType.Phone && captchaRef.current) {
            document.getElementById("send-verify-code-phone")?.click();
        }
    }, [sendCode, type, isCaptcha]);

    // Workaround to prevent browser auto complete this field
    // however, it still cannot prevent auto complete panel from showing up
    const [readOnly, setReadOnly] = useState(true);
    useEffect(() => {
        const ticket = setTimeout(() => {
            setReadOnly(false);
            initCaptcha(isCaptcha);
        }, 1000);
        return () => clearTimeout(ticket);
    }, [initCaptcha, isCaptcha]);

    return (
        <>
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
                            onClick={isCaptcha ? verifyBtnClick : sendCode}
                        >
                            {t("send-verify-code")}
                        </Button>
                    )
                }
                {...restProps}
            />
            {isCaptcha && (
                <Button className="send-verify-code-button" id="send-verify-code-phone"></Button>
            )}
        </>
    );
};
