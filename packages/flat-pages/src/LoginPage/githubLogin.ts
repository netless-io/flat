import { v4 as uuidv4 } from "uuid";
import { LoginExecutor } from "./utils/disposer";
import { errorTips } from "flat-components";
import { FLAT_SERVER_LOGIN, setAuthUUID, loginProcess } from "@netless/flat-server-api";
import { globalStore } from "@netless/flat-stores";

export const githubLogin: LoginExecutor = (onSuccess, windowsBtn) => {
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
                  getGithubURL(authUUID, FLAT_SERVER_LOGIN.GITHUB_CALLBACK),
              )
            : void window.open(getGithubURL(authUUID, FLAT_SERVER_LOGIN.GITHUB_CALLBACK));

        const githubLoginProcessRequest = async (): Promise<void> => {
            try {
                const data = await loginProcess(authUUID);

                if (!data.name) {
                    timer = window.setTimeout(githubLoginProcessRequest, 2000);
                    return;
                }

                onSuccess(data);
            } catch (err) {
                errorTips(err);
            }
        };

        void githubLoginProcessRequest();
    })();

    return () => {
        window.clearTimeout(timer);
    };
};

export function getGithubURL(authUUID: string, redirect_uri: string): string {
    const clientId = globalStore.serverRegionConfig?.github.clientId;
    if (!clientId) {
        console.warn("missing server region config");
    }
    const redirectURL = encodeURIComponent(redirect_uri);
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectURL}&state=${authUUID}`;
}
