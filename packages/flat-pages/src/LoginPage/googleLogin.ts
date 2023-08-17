import { v4 as uuidv4 } from "uuid";
import { LoginExecutor } from "./utils/disposer";
import { errorTips } from "flat-components";
import { FLAT_SERVER_LOGIN, setAuthUUID, loginProcess } from "@netless/flat-server-api";
import { globalStore } from "@netless/flat-stores";

// @TODO: migrate to new google login api before 2023
//        https://developers.google.com/identity/gsi/web
export const googleLogin: LoginExecutor = (onSuccess, windowsBtn) => {
    let timer = NaN;
    const authUUID = uuidv4();

    void (async () => {
        try {
            await setAuthUUID(authUUID);
        } catch (err) {
            errorTips(err);
            return;
        }

        windowsBtn
            ? windowsBtn.openExternalBrowser(
                  getGoogleURL(authUUID, FLAT_SERVER_LOGIN.GOOGLE_CALLBACK),
              )
            : void window.open(getGoogleURL(authUUID, FLAT_SERVER_LOGIN.GOOGLE_CALLBACK));

        const googleLoginProcessRequest = async (): Promise<void> => {
            try {
                const data = await loginProcess(authUUID);

                if (!data.name) {
                    timer = window.setTimeout(googleLoginProcessRequest, 2000);
                    return;
                }

                onSuccess(data);
            } catch (err) {
                errorTips(err);
            }
        };

        void googleLoginProcessRequest();
    })();

    return () => {
        window.clearTimeout(timer);
    };
};

export function getGoogleURL(authUUID: string, redirect_uri: string): string {
    const clientId = globalStore.serverRegionConfig?.google.clientId;
    if (!clientId) {
        console.warn("missing server region config");
    }
    const scopes = ["openid", "https://www.googleapis.com/auth/userinfo.profile"];
    const scope = encodeURIComponent(scopes.join(" "));
    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=online&scope=${scope}&client_id=${clientId}&redirect_uri=${redirect_uri}&state=${authUUID}`;
}
