import { LoginProcessResult } from "../../apiMiddleware/flatServer";

export type LoginDisposer = () => void;

export type LoginExecutor = (
    onSuccess: (successResult: LoginProcessResult) => void,
) => LoginDisposer;
