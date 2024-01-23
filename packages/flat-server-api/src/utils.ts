import {
    FLAT_REGION,
    FLAT_SERVER_BASE_URL_V1,
    FLAT_SERVER_BASE_URL_V2,
    Region,
    SERVER_DOMAINS,
    Status,
} from "./constants";
import { ServerRequestError, RequestErrorCode } from "./error";
import { v4 as uuidv4 } from "uuid";

let authToken = /* @__PURE__*/ localStorage.getItem("FlatAuthToken");

export type FlatServerResponse<T> =
    | {
          status: Status.Success;
          data: T;
      }
    | {
          status: Status.Process;
          data: T;
      };

export type FlatServerRawResponseData<T> =
    | FlatServerResponse<T>
    | {
          status: Status.Failed;
          code: RequestErrorCode;
          message?: string;
          detail?: unknown;
      };

export function setFlatAuthToken(token: string): void {
    authToken = token;
    localStorage.setItem("FlatAuthToken", token);
}

function getDefaultRegion(): Region {
    if (FLAT_REGION === "CN") {
        return Region.CN_HZ;
    }
    if (FLAT_REGION === "SG") {
        return Region.SG;
    }
    throw new Error("Unknown FLAT_REGION: " + FLAT_REGION);
}

const defaultRegion = getDefaultRegion();

export function chooseServer(payload: any, enableFlatServerV2?: boolean): string {
    let server = enableFlatServerV2 ? FLAT_SERVER_BASE_URL_V2 : FLAT_SERVER_BASE_URL_V1;

    let region = defaultRegion;
    if (payload !== null && typeof payload === "object") {
        // Please check all server api's payload to make sure roomUUID is from these fields:
        // the "uuid" is maybe an invite code
        const uuid = payload.roomUUID || payload.uuid || payload.periodicUUID || payload.pmi;

        if (typeof uuid === "string") {
            if ((uuid.length === 11 && uuid[0] === "1") || uuid.startsWith("CN-")) {
                region = Region.CN_HZ;
            }
            if ((uuid.length === 11 && uuid[0] === "2") || uuid.startsWith("SG-")) {
                region = Region.SG;
            }
        }
    }
    if (region === defaultRegion) {
        return server;
    }

    // replace server domain with another region's
    server = `https://${SERVER_DOMAINS[region.slice(0, 2).toUpperCase()]}/${
        enableFlatServerV2 ? "v2" : "v1"
    }`;

    if (server.includes("undefined")) {
        console.log("server domains:", SERVER_DOMAINS);
        throw new Error(`Failed to choose server for region: ${region}`);
    }

    return server;
}

export async function requestFlatServer<TPayload, TResult>(
    action: string,
    payload?: TPayload,
    init?: Partial<RequestInit>,
    token: string | null = authToken,
    enableFlatServerV2?: boolean,
): Promise<FlatServerResponse<TResult>> {
    const headers = new Headers(init?.headers);
    headers.set("accept", "application/json, text/plain, */*, x-session-id, x-request-id");
    const config: RequestInit = { method: "POST", ...init, headers };

    if (!sessionStorage.getItem("sessionID")) {
        sessionStorage.setItem("sessionID", uuidv4());
    }

    const sessionID = sessionStorage.getItem("sessionID");

    if (sessionID) {
        headers.set("x-session-id", sessionID);
    }

    headers.set("x-request-id", uuidv4());

    if (payload) {
        config.body = JSON.stringify(payload);
        headers.set("content-type", "application/json");
    }

    if (token) {
        headers.set("authorization", "Bearer " + token);
    }

    const response = await fetch(`${chooseServer(payload, enableFlatServerV2)}/${action}`, config);

    if (!response.ok) {
        // @TODO create a timeout error code
        throw new ServerRequestError(RequestErrorCode.ServerFail);
    }

    const data: FlatServerRawResponseData<TResult> = await response.json();

    if (data.status !== Status.Success && data.status !== Status.Process) {
        throw new ServerRequestError(data.code, data.message, data.detail);
    }

    return data;
}

export async function post<TPayload, TResult>(
    action: string,
    payload?: TPayload,
    init?: Partial<RequestInit>,
    token?: string,
): Promise<TResult> {
    const authorization = token || authToken;
    if (!authorization) {
        throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
    }
    const res = await requestFlatServer<TPayload, TResult>(action, payload, init, authorization);

    if (process.env.NODE_ENV !== "production") {
        if (res.status !== Status.Success) {
            throw new TypeError(
                `[Flat API] ${action} returns unexpected processing status: ${res.status}`,
            );
        }
    }

    return res.data;
}

export async function postV2<TPayload, TResult>(
    action: string,
    payload?: TPayload,
    init?: Partial<RequestInit>,
    token?: string,
): Promise<TResult> {
    const authorization = token || authToken;

    if (!authorization) {
        throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
    }
    const res = await requestFlatServer<TPayload, TResult>(
        action,
        payload,
        init,
        authorization,
        true,
    );

    if (process.env.NODE_ENV !== "production") {
        if (res.status !== Status.Success) {
            throw new TypeError(
                `[Flat API] ${action} returns unexpected processing status: ${res.status}`,
            );
        }
    }

    return res.data;
}

export async function postNotAuth<TPayload, TResult>(
    action: string,
    payload?: TPayload,
    init?: Partial<RequestInit>,
): Promise<TResult> {
    const res = await requestFlatServer<TPayload, TResult>(action, payload, init, "");

    if (process.env.NODE_ENV !== "production") {
        if (res.status !== Status.Success) {
            throw new TypeError(
                `[Flat API] ${action} returns unexpected processing status: ${res.status}`,
            );
        }
    }

    return res.data;
}

export async function getNotAuth<TResult>(
    action: string,
    init?: Partial<RequestInit>,
): Promise<TResult> {
    const res = await requestFlatServer<undefined, TResult>(
        action,
        undefined,
        { ...init, method: "GET" },
        "",
    );

    if (process.env.NODE_ENV !== "production") {
        if (res.status !== Status.Success) {
            throw new TypeError(
                `[Flat API] ${action} returns unexpected processing status: ${res.status}`,
            );
        }
    }

    return res.data;
}

export async function getV2NotAuth<TResult>(
    action: string,
    init?: Partial<RequestInit>,
): Promise<TResult> {
    const res = await requestFlatServer<undefined, TResult>(
        action,
        undefined,
        { ...init, method: "GET" },
        "",
        true,
    );

    if (process.env.NODE_ENV !== "production") {
        if (res.status !== Status.Success) {
            throw new TypeError(
                `[Flat API v2.0] ${action} returns unexpected processing status: ${res.status}`,
            );
        }
    }

    return res.data;
}

export async function postV2NotAuth<TPayload, TResult>(
    action: string,
    payload?: TPayload,
    init?: Partial<RequestInit>,
): Promise<TResult> {
    const res = await requestFlatServer<TPayload, TResult>(action, payload, init, "", true);

    if (process.env.NODE_ENV !== "production") {
        if (res.status !== Status.Success) {
            throw new TypeError(
                `[Flat API v2.0] ${action} returns unexpected processing status: ${res.status}`,
            );
        }
    }

    return res.data;
}
