import { LoginProcessResult } from "@netless/flat-server-api";

export type LoginDisposer = () => void;

export type LoginExecutor = (
    onSuccess: (successResult: LoginProcessResult) => void,
) => LoginDisposer;
