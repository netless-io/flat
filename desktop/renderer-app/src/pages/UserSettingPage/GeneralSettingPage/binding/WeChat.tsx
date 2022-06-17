import classNames from "classnames";
import { v4 } from "uuid";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { message, Modal } from "antd";
import { WechatFilled } from "@ant-design/icons";

import { getQRCodeURL } from "../../../LoginPage/WeChatLogin";
import {
    setBindingAuthUUID,
    bindingProcess,
    removeBinding,
    LoginPlatform,
} from "../../../../api-middleware/flatServer";
import { FLAT_SERVER_USER_BINDING } from "../../../../api-middleware/flatServer/constants";
import { useSafePromise } from "../../../../utils/hooks/lifecycle";
import { GlobalStore } from "../../../../stores/global-store";
import { errorTips } from "../../../../components/Tips/ErrorTips";

export interface BindingWeChatProps {
    isBind: boolean;
    onRefresh: () => void;
    globalStore: GlobalStore;
}

export const BindWeChat: React.FC<BindingWeChatProps> = ({ isBind, onRefresh, globalStore }) => {
    const sp = useSafePromise();
    const { t } = useTranslation();
    const [authUUID, setAuthUUID] = useState("");
    const [qrCodeURL, setQRCodeURL] = useState("");

    const cancel = useCallback((): void => {
        setAuthUUID("");
        setQRCodeURL("");
        onRefresh();
    }, [onRefresh]);

    useEffect(() => {
        let timer = NaN;
        async function waitUntilBindFinish(): Promise<void> {
            const result = await sp(bindingProcess(authUUID));
            if (result.processing) {
                timer = window.setTimeout(waitUntilBindFinish, 2000);
            } else {
                if (!result.status) {
                    message.info(t("bind-wechat-failed"));
                }
                cancel();
            }
        }
        if (qrCodeURL && authUUID) {
            waitUntilBindFinish();
            return () => {
                Number.isNaN(timer) || window.clearTimeout(timer);
            };
        }
        return;
    }, [authUUID, cancel, onRefresh, qrCodeURL, sp, t]);

    const bindWeChat = async (): Promise<void> => {
        const authUUID = v4();
        setAuthUUID(authUUID);
        await sp(setBindingAuthUUID(authUUID));
        setQRCodeURL(getQRCodeURL(authUUID, FLAT_SERVER_USER_BINDING.WECHAT_CALLBACK));
    };

    const unbind = (): void => {
        Modal.confirm({
            content: t("unbind-confirm"),
            onOk: async () => {
                try {
                    const { token } = await sp(removeBinding(LoginPlatform.WeChat));
                    globalStore.updateUserToken(token);
                    onRefresh();
                    message.info(t("unbind-success"));
                } catch (err) {
                    errorTips(err);
                }
            },
        });
    };

    return (
        <>
            <span
                className={classNames("binding-wechat", {
                    "is-bind": isBind,
                })}
                title={isBind ? t("is-bind") : t("not-bind")}
                onClick={isBind ? unbind : bindWeChat}
            >
                <WechatFilled style={{ color: "#fff" }} />
            </span>
            <Modal
                centered
                destroyOnClose
                className="binding-wechat-modal"
                footer={null}
                title={t("bind-wechat")}
                visible={!!qrCodeURL}
                onCancel={cancel}
            >
                <iframe
                    className="binding-wechat-iframe"
                    frameBorder="0"
                    scrolling="no"
                    src={qrCodeURL}
                    title="wechat"
                />
            </Modal>
        </>
    );
};
