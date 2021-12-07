import { message } from "antd";
import { ServerRequestError } from "../../utils/error/server-request-error";
import { NODE_ENV } from "../../constants/process";
import { i18n } from "../../utils/i18n";

export const errorTips = (e: unknown): void => {
    if (NODE_ENV === "development") {
        console.error(e);
    }

    if (e instanceof ServerRequestError) {
        void message.error({
            content: i18n.t(e.errorMessage),
            key: e.errorMessage,
        });
    } else {
        const { message: content, message: key } = e as Error;
        void message.error({ content, key });
    }
};
