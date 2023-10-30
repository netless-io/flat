import { v4 } from "uuid";
import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { message, Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { GoogleSVG } from "./icons/GoogleSVG";

import { GlobalStore } from "@netless/flat-stores";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import {
    bindingProcess,
    FLAT_SERVER_USER_BINDING,
    LoginPlatform,
    removeBinding,
    setBindingAuthUUID,
} from "@netless/flat-server-api";
import { getGoogleURL } from "../../../LoginPage/googleLogin";
import { errorTips } from "flat-components";

export interface BindGoogleProps {
    name: string;
    isBind: boolean;
    onRefresh: () => void;
    globalStore: GlobalStore;
}

export const BindGoogle: React.FC<BindGoogleProps> = ({ name, isBind, onRefresh, globalStore }) => {
    const sp = useSafePromise();
    const t = useTranslate();
    const [authUUID, setAuthUUID] = useState("");

    const cancel = useCallback((): void => {
        setAuthUUID("");
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
                    message.info(t("bind-google-failed"));
                }
                cancel();
            }
        }
        if (authUUID) {
            waitUntilBindFinish();
            return () => {
                Number.isNaN(timer) || window.clearTimeout(timer);
            };
        }
        return;
    }, [authUUID, cancel, onRefresh, sp, t]);

    const bindGoogle = async (): Promise<void> => {
        const authUUID = v4();
        setAuthUUID(authUUID);
        await sp(setBindingAuthUUID(authUUID));
        void window.open(getGoogleURL(authUUID, FLAT_SERVER_USER_BINDING.GOOGLE_CALLBACK));
    };

    const unbind = (): void => {
        Modal.confirm({
            content: t("unbind-confirm"),
            onOk: async () => {
                try {
                    const { token } = await sp(removeBinding(LoginPlatform.Google));
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
        <span
            className={classNames("binding-google")}
            title={isBind ? t("is-bind", { name }) : t("not-bind")}
            onClick={isBind ? unbind : bindGoogle}
        >
            {GoogleSVG({ binding: isBind })}
        </span>
    );
};
