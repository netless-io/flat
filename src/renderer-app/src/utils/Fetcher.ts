import Axios from "axios";
import { FLAT_SERVER_LOGIN } from "../constants/FlatServer";

export const fetcher = Axios.create({
    baseURL: FLAT_SERVER_LOGIN.HTTPS_LOGIN,
    timeout: 1000,
});

fetcher.interceptors.request.use(config => {
    config.headers = config.headers || {};
    const Authorization = localStorage.getItem("token");
    if (Authorization) config.headers["Authorization"] = "Bearer " + Authorization;
    return config;
});
