import { v4 as uuidv4 } from "uuid";
import { LoginExecutor } from "./utils";
import { QQ } from "../constants/process";
import { errorTips } from "flat-components";
import { FLAT_SERVER_LOGIN, setAuthUUID, loginProcess } from "@netless/flat-server-api";

export const qqLogin: LoginExecutor = (onSuccess, windowsBtn) => {
    let timer = NaN;
    const authUUID = uuidv4();

    void (async () => {
        try {
            await setAuthUUID(authUUID);
        } catch (err) {
            errorTips(err);
        }

        windowsBtn
            ? windowsBtn.openExternalBrowser(getQqURL(authUUID, FLAT_SERVER_LOGIN.QQ_CALLBACK))
            : void window.open(getQqURL(authUUID, FLAT_SERVER_LOGIN.QQ_CALLBACK));

        const qqLoginProcessRequest = async (): Promise<void> => {
            try {
                const data = await loginProcess(authUUID);
                if (!data.name) {
                    timer = window.setTimeout(qqLoginProcessRequest, 2000);
                    return;
                }

                onSuccess(data);
            } catch (err) {
                errorTips(err);
            }
        };

        void qqLoginProcessRequest();
    })();

    return () => {
        window.clearTimeout(timer);
    };
};

export function getQqURL(authUUID: string, redirect_uri: string): string {
    const redirectURL = encodeURIComponent(redirect_uri);
    return `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${QQ.CLIENT_ID}&redirect_uri=${redirectURL}&state=${authUUID}`;
}
