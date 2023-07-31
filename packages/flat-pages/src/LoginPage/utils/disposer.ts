import { LoginProcessResult } from "@netless/flat-server-api";
import { WindowsBtnContextInterface } from "../../components/WindowsBtnContext";
import { errorTips } from "flat-components";

export type LoginDisposer = () => void;

export type LoginExecutor = (
    onSuccess: (successResult: LoginProcessResult) => void,
    windowsBtn?: WindowsBtnContextInterface,
) => LoginDisposer;

export function wrap(promise: Promise<unknown>): Promise<boolean> {
    return promise
        .then(() => true)
        .catch(err => {
            errorTips(err);
            return false;
        });
}
