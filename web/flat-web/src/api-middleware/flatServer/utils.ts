import Axios, { AxiosRequestConfig } from "axios";
import { globalStore } from "../../stores/GlobalStore";
import { FLAT_SERVER_VERSIONS, Status } from "./constants";
import { ServerRequestError } from "../../utils/error/server-request-error";
import { RequestErrorCode } from "../../constants/error-code";

export type FlatServerResponse<T> =
    | {
          status: Status.Success;
          data: T;
      }
    | {
          status: Status.Failed;
          code: RequestErrorCode;
      };

export async function post<Payload, Result>(
    action: string,
    payload: Payload,
    params?: AxiosRequestConfig["params"],
    token?: string,
): Promise<Result> {
    const config: AxiosRequestConfig = {
        params,
    };

    const Authorization = token || globalStore.userInfo?.token;
    if (!Authorization) {
        throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
    }

    config.headers = {
        Authorization: "Bearer " + Authorization,
    };

    const { data: res } = await Axios.post<FlatServerResponse<Result>>(
        `${FLAT_SERVER_VERSIONS.V1}/${action}`,
        payload,
        config,
    );

    if (res.status !== Status.Success) {
        throw new ServerRequestError(res.code);
    }

    return res.data;
}

export const PROCESSING = Symbol("Process");

// TODO: Refactor `post` `getNoAuth` APIs to support Status.X
export async function post2<Payload, Result>(
    action: string,
    payload: Payload,
    params?: AxiosRequestConfig["params"],
    token?: string,
): Promise<Result | typeof PROCESSING> {
    const config: AxiosRequestConfig = {
        params,
    };

    const Authorization = token || globalStore.userInfo?.token;
    if (!Authorization) {
        throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
    }

    config.headers = {
        Authorization: "Bearer " + Authorization,
    };

    const { data: res } = await Axios.post<FlatServerResponse<Result> | { status: Status.Process }>(
        `${FLAT_SERVER_VERSIONS.V1}/${action}`,
        payload,
        config,
    );

    if (res.status === Status.Process) {
        return PROCESSING;
    }

    if (res.status === Status.Success) {
        return res.data;
    }

    throw new ServerRequestError(res.code);
}

export async function postNotAuth<Payload, Result>(
    action: string,
    payload: Payload,
    params?: AxiosRequestConfig["params"],
): Promise<Result> {
    const config: AxiosRequestConfig = {
        params,
    };

    const { data: res } = await Axios.post<FlatServerResponse<Result>>(
        `${FLAT_SERVER_VERSIONS.V1}/${action}`,
        payload,
        config,
    );

    if (res.status !== Status.Success) {
        throw new ServerRequestError(res.code);
    }

    return res.data;
}

export async function getNotAuth<Result>(
    action: string,
    params?: AxiosRequestConfig["params"],
): Promise<Result> {
    const config: AxiosRequestConfig = {
        params,
    };

    const { data: res } = await Axios.get<FlatServerResponse<Result>>(
        `${FLAT_SERVER_VERSIONS.V1}/${action}`,
        config,
    );

    if (res.status !== Status.Success) {
        throw new ServerRequestError(res.code);
    }

    return res.data;
}
