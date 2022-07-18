import Axios, { AxiosRequestConfig } from "axios";
import { FLAT_SERVER_VERSIONS, Status } from "./constants";
import { ServerRequestError, RequestErrorCode } from "./error";

let authToken = localStorage.getItem("FlatAuthToken");

export type FlatServerResponse<T> =
    | {
          status: Status.Success;
          data: T;
      }
    | {
          status: Status.Failed;
          code: RequestErrorCode;
      };

export type FlatServerRawResponseData<T> =
    | FlatServerResponse<T>
    | {
          status: Status.Process;
          data: T;
      };

export function setFlatAuthToken(token: string): void {
    authToken = token;
    localStorage.setItem("FlatAuthToken", token);
}

export async function postRAW<Payload, Result>(
    action: string,
    payload: Payload,
    params?: AxiosRequestConfig["params"],
    token?: string,
): Promise<FlatServerRawResponseData<Result>> {
    const config: AxiosRequestConfig = {
        params,
    };

    const Authorization = token || authToken;
    if (!Authorization) {
        throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
    }

    config.headers = {
        Authorization: "Bearer " + Authorization,
    };

    const { data: res } = await Axios.post<FlatServerRawResponseData<Result>>(
        `${FLAT_SERVER_VERSIONS.V1}/${action}`,
        payload,
        config,
    );

    if (res.status !== Status.Success && res.status !== Status.Process) {
        throw new ServerRequestError(res.code);
    }

    return res;
}

export async function post<Payload, Result>(
    action: string,
    payload: Payload,
    params?: AxiosRequestConfig["params"],
    token?: string,
): Promise<Result> {
    const res = await postRAW<Payload, Result>(action, payload, params, token);
    if (res.status !== Status.Success) {
        if (res.status === Status.Process) {
            throw new TypeError(`[Flat API] ${action} returns unexpected processing status`);
        } else {
            throw new ServerRequestError(res.code);
        }
    }
    return res.data;
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
