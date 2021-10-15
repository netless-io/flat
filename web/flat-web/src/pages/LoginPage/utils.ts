import { LoginProcessResult } from "../../api-middleware/flatServer";

export type LoginDisposer = () => void;

export type LoginExecutor = (
    onSuccess: (successResult: LoginProcessResult) => void,
) => LoginDisposer;
