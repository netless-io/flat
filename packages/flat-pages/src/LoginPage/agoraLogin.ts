import { v4 as uuidv4 } from "uuid";
import { LoginExecutor } from "./utils/disposer";
import { errorTips } from "flat-components";
import { globalStore } from "@netless/flat-stores";
import { FLAT_SERVER_LOGIN, setAuthUUID } from "@netless/flat-server-api";

export const agoraLogin: LoginExecutor = () => {
    const authUUID = uuidv4();

    void (async () => {
        try {
            await setAuthUUID(authUUID);
        } catch (err) {
            errorTips(err);
            return;
        }

        window.location.href = getAgoraURL(authUUID, FLAT_SERVER_LOGIN.AGORA_CALLBACK);
    })();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
};

export function getAgoraURL(authUUID: string, redirect_uri: string): string {
    const clientId = globalStore.serverRegionConfig?.agora.clientId;
    if (!clientId) {
        console.warn("missing server region config");
    }
    const redirectURL = encodeURIComponent(redirect_uri);
    return `https://sso2.agora.io/api/v0/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURL}&scope=basic_info&state=${authUUID}&toPage=signup`;
}
