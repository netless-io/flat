import { FLAT_SERVER_LOGIN } from "../apiMiddleware/flatServer/constants";
import { WECHAT } from "../constants/Process";

export const QRURL = (wsID: string, state: string): string => {
    const redirectURL = encodeURIComponent(`${FLAT_SERVER_LOGIN.WECHAT_CALLBACK}/${wsID}`);

    return `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT.APP_ID}&scope=snsapi_login&redirect_uri=${redirectURL}&state=${state}&login_type=jssdk&self_redirect=true&style=black&href=`;
};
