import { LoginProcessResult } from "@netless/flat-server-api";
import { WindowsBtnContextInterface } from "../components/WindowsBtnContext";

export type LoginDisposer = () => void;

export type LoginExecutor = (
    onSuccess: (successResult: LoginProcessResult) => void,
    windowsBtn?: WindowsBtnContextInterface,
) => LoginDisposer;
