import { setAuthUUID, loginProcess } from "../../api-middleware/flatServer";
import { v4 as uuidv4 } from "uuid";
import { LoginExecutor } from "./utils";
import { errorTips } from "../../components/Tips/ErrorTips";
import { FLAT_SERVER_LOGIN } from "../../api-middleware/flatServer/constants";
import { GOOGLE } from "../../constants/process";

// @TODO: migrate to new google login api before 2023
//        https://developers.google.com/identity/gsi/web
export const googleLogin: LoginExecutor = onSuccess => {
    let timer = NaN;
    const authUUID = uuidv4();
    const scopes = ["openid", "https://www.googleapis.com/auth/userinfo.profile"];

    function getGoogleURL(authUUID: string): string {
        const redirectURL = encodeURIComponent(FLAT_SERVER_LOGIN.GOOGLE_CALLBACK);
        const scope = encodeURIComponent(scopes.join(" "));
        return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=online&scope=${scope}&client_id=${GOOGLE.CLIENT_ID}&redirect_uri=${redirectURL}&state=${authUUID}`;
    }

    void (async () => {
        try {
            await setAuthUUID(authUUID);
        } catch (err) {
            errorTips(err);
            return;
        }

        void window.open(getGoogleURL(authUUID));

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
