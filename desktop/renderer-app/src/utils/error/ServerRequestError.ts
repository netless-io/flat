import { RequestError } from "./RequestError";
import { RequestErrorCode, RequestErrorMessage } from "../../constants/ErrorCode";

export class ServerRequestError extends RequestError {
    errorCode: RequestErrorCode;
    errorMessage: string;

    constructor(errorCode: RequestErrorCode) {
        super(`request failed: ${errorCode}`);
        this.errorCode = errorCode;
        this.errorMessage = RequestErrorMessage[errorCode];
    }
}
