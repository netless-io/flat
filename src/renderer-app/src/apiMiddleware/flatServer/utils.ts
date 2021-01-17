import Axios, { AxiosRequestConfig } from "axios";
import { getWechatInfo } from "../../utils/localStorage/accounts";
import { FLAT_SERVER_VERSIONS, Status } from "./constants";

export type FlatServerResponse<T> =
    | {
          status: Status.Success;
          data: T;
      }
    | {
          status: Status.Failed;
          code: number;
      };

export async function post<Payload, Result>(
    action: string,
    payload: Payload,
    params?: AxiosRequestConfig["params"],
): Promise<Result> {
    const config: AxiosRequestConfig = {
        params,
    };

    const Authorization = getWechatInfo()?.token;
    if (Authorization) {
        config.headers = {
            Authorization: "Bearer " + Authorization,
        };
    } else {
        throw new Error("not login");
    }

    const { data: res } = await Axios.post<FlatServerResponse<Result>>(
        `${FLAT_SERVER_VERSIONS.V1HTTPS}/${action}`,
        payload,
        config,
    );

    if (res.status !== Status.Success) {
        // @TODO handle fetcher error
        throw new Error(`Flat server error code ${res.code} for location "${action}".`);
    }

    return res.data;
}
