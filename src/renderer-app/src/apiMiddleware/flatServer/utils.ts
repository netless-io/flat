import Axios, { AxiosRequestConfig } from "axios";
import { globalStore } from "../../stores/GlobalStore";
import { FLAT_SERVER_VERSIONS, Status } from "./constants";
import { ServerRequestError } from "../../utils/error/ServerRequestError";
import { RequestErrorCode } from "../../constants/ErrorCode";

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
): Promise<Result> {
    const config: AxiosRequestConfig = {
        params,
    };

    const Authorization = globalStore.wechat?.token;
    if (!Authorization) {
        throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
    }

    config.headers = {
        Authorization: "Bearer " + Authorization,
    };

    const { data: res } = await Axios.post<FlatServerResponse<Result>>(
        `${FLAT_SERVER_VERSIONS.V1HTTPS}/${action}`,
        payload,
        config,
    );

    if (res.status !== Status.Success) {
        throw new ServerRequestError(res.code);
    }

    return res.data;
}
