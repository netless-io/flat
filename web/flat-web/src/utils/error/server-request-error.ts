import { RequestError } from "./request-error";
import { RequestErrorCode, RequestErrorMessage } from "../../constants/error-code";

export class ServerRequestError extends RequestError {
    public errorCode: RequestErrorCode;
    public errorMessage: string;

    public constructor(errorCode: RequestErrorCode) {
        super(`request failed: ${errorCode}`);
        this.errorCode = errorCode;
        this.errorMessage = RequestErrorMessage[errorCode];
    }
}
