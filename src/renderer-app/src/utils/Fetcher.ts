import Axios from "axios";
import { FLAT_SERVER_LOGIN } from "../constants/FlatServer";
import { getWechatInfo } from "./localStorage/accounts";

export const fetcher = Axios.create({
    baseURL: FLAT_SERVER_LOGIN.HTTPS_LOGIN,
    timeout: 1000,
});

fetcher.interceptors.request.use(config => {
    config.headers = config.headers || {};
    const Authorization = getWechatInfo()?.token;
    if (Authorization) config.headers["Authorization"] = "Bearer " + Authorization;
    return config;
});
