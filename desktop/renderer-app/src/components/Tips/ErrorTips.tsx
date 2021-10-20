import { message } from "antd";
import { ServerRequestError } from "../../utils/error/server-request-error";
import { NODE_ENV } from "../../constants/process";
import { i18n } from "../../utils/i18n";

export const errorTips = (e: unknown): void => {
    if (NODE_ENV === "development") {
        console.error(e);
    }

    if (e instanceof ServerRequestError) {
        void message.error(i18n.t(e.errorMessage));
    } else {
        void message.error((e as Error).message);
    }
};
