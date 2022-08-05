import { shell } from "electron";
import { v4 } from "uuid";
import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { message, Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { GithubFilled } from "@ant-design/icons";

import { GlobalStore } from "../../../../stores/global-store";
import { useSafePromise } from "../../../../utils/hooks/lifecycle";
import {
    bindingProcess,
    LoginPlatform,
    removeBinding,
    setBindingAuthUUID,
} from "../../../../api-middleware/flatServer";
import { FLAT_SERVER_USER_BINDING } from "../../../../api-middleware/flatServer/constants";
import { getGithubURL } from "../../../LoginPage/githubLogin";
import { errorTips } from "../../../../components/Tips/ErrorTips";

export interface BindGitHubProps {
    isBind: boolean;
    onRefresh: () => void;
    globalStore: GlobalStore;
}

export const BindGitHub: React.FC<BindGitHubProps> = ({ isBind, onRefresh, globalStore }) => {
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
                    message.info(t("bind-wechat-failed"));
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

    const bindGitHub = async (): Promise<void> => {
        const authUUID = v4();
        setAuthUUID(authUUID);
        await sp(setBindingAuthUUID(authUUID));
        void shell.openExternal(getGithubURL(authUUID, FLAT_SERVER_USER_BINDING.GITHUB_CALLBACK));
    };

    const unbind = (): void => {
        Modal.confirm({
            content: t("unbind-confirm"),
            onOk: async () => {
                try {
                    const { token } = await sp(removeBinding(LoginPlatform.Github));
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
            className={classNames("binding-github", {
                "is-bind": isBind,
            })}
            title={isBind ? t("is-bind") : t("not-bind")}
            onClick={isBind ? unbind : bindGitHub}
        >
            <GithubFilled style={{ color: "#fff" }} />
        </span>
    );
};
