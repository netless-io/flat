import { v4 as uuidv4 } from "uuid";
import { loginProcess, setAuthUUID } from "../../api-middleware/flatServer";
import { FLAT_SERVER_LOGIN } from "../../api-middleware/flatServer/constants";
import { errorTips } from "../../components/Tips/ErrorTips";
import { GITHUB } from "../../constants/process";
import { LoginExecutor } from "./utils";

export const githubLogin: LoginExecutor = onSuccess => {
    let timer = NaN;
    const authUUID = uuidv4();

    function getGithubURL(authUUID: string): string {
        const redirectURL = encodeURIComponent(FLAT_SERVER_LOGIN.GITHUB_CALLBACK);
        return `https://github.com/login/oauth/authorize?client_id=${GITHUB.CLIENT_ID}&redirect_uri=${redirectURL}&state=${authUUID}`;
    }

    void (async () => {
        try {
            await setAuthUUID(authUUID);
        } catch (err) {
            errorTips(err);
        }

        void window.open(getGithubURL(authUUID));

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
