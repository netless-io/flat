import { RequestError } from "./RequestError";
import { RequestErrorCode, RequestErrorMessage } from "../../constants/ErrorCode";

export class ServerRequestError extends RequestError {
    public errorCode: RequestErrorCode;
    public errorMessage: string;

    public constructor(errorCode: RequestErrorCode) {
        super(`request failed: ${errorCode}`);
        this.errorCode = errorCode;
        this.errorMessage = RequestErrorMessage[errorCode];
    }
}
