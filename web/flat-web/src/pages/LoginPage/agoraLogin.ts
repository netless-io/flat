import { setAuthUUID, loginProcess } from "../../api-middleware/flatServer";
import { v4 as uuidv4 } from "uuid";
import { LoginExecutor } from "./utils";
import { errorTips } from "../../components/Tips/ErrorTips";
import { FLAT_SERVER_LOGIN } from "../../api-middleware/flatServer/constants";
import { AGORA_OAUTH } from "../../constants/process";

export const agoraLogin: LoginExecutor = onSuccess => {
    let timer = NaN;
    const authUUID = uuidv4();

    function getAgoraURL(authUUID: string): string {
        const redirectURL = encodeURIComponent(FLAT_SERVER_LOGIN.AGORA_CALLBACK);
        return `https://sso2.agora.io/api/v0/oauth/authorize?response_type=code&client_id=${AGORA_OAUTH.CLIENT_ID}&redirect_uri=${redirectURL}&scope=basic_info&state=${authUUID}&toPage=signup`;
    }

    void (async () => {
        try {
            await setAuthUUID(authUUID);
        } catch (err) {
            errorTips(err);
        }

        void window.open(getAgoraURL(authUUID));

        const agoraLoginProcessRequest = async (): Promise<void> => {
            try {
                const data = await loginProcess(authUUID);

                if (!data.name) {
                    timer = window.setTimeout(agoraLoginProcessRequest, 2000);
                    return;
                }

                onSuccess(data);
            } catch (err) {
                errorTips(err);
            }
        };

        void agoraLoginProcessRequest();
    })();

    return () => {
        window.clearTimeout(timer);
    };
};
