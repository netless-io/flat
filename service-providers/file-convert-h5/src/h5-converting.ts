import { FileConvertStep, ServerRequestError } from "@netless/flat-server-api";

export async function queryH5ConvertingStatus(
    fileURL: string,
): Promise<{ status: FileConvertStep; error?: Error }> {
    try {
        const response = await fetch(fileURL.replace(/[^/]+$/, "") + "result", {
            method: "HEAD",
        });
        if (response.headers.get("x-oss-meta-success") !== "true") {
            const errorCode = Number(response.headers.get("x-oss-meta-error-code"));
            if (errorCode > 0) {
                return {
                    status: FileConvertStep.Failed,
                    error: new ServerRequestError(errorCode),
                };
            }
            if (response.status >= 200 && response.status < 500) {
                return { status: FileConvertStep.Converting };
            }
            return { status: FileConvertStep.Failed, error: new Error(response.statusText) };
        }
        return { status: FileConvertStep.Done };
    } catch (e) {
        console.warn(e);
        return { status: FileConvertStep.Converting };
    }
}
