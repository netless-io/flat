import { ServerRequestError } from "./error";

export type H5ConvertingStatusType = "Converting" | "Finished" | "Failed";

export type H5ConvertingStatusResultNormal = {
    status: Exclude<H5ConvertingStatusType, "Failed">;
    error?: undefined;
};

export type H5ConvertingStatusResultFailed = {
    status: "Failed";
    error: Error;
};

export type H5ConvertingStatusResult =
    | H5ConvertingStatusResultNormal
    | H5ConvertingStatusResultFailed;

export async function queryH5ConvertingStatus(fileURL: string): Promise<H5ConvertingStatusResult> {
    try {
        const response = await fetch(fileURL.replace(/[^/]+$/, "") + "result", { method: "HEAD" });
        if (response.headers.get("x-oss-meta-success") !== "true") {
            const errorCode = Number(response.headers.get("x-oss-meta-error-code"));
            if (errorCode > 0) {
                return {
                    status: "Failed",
                    error: new ServerRequestError(errorCode),
                };
            }
            if (response.status >= 200 && response.status < 500) {
                return { status: "Converting" };
            }
            return { status: "Failed", error: new Error(response.statusText) };
        }
        return { status: "Finished" };
    } catch (e) {
        console.warn(e);
        return { status: "Converting" };
    }
}
