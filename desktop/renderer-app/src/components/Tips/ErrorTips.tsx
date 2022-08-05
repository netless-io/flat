import { FlatI18n } from "@netless/flat-i18n";
import { message } from "antd";
import { ServerRequestError } from "../../utils/error/server-request-error";

export const errorTips = (e: unknown): void => {
    if (process.env.NODE_ENV === "development") {
        console.error(e);
    }

    if (e instanceof ServerRequestError) {
        void message.error({
            content: FlatI18n.t(e.errorMessage),
            key: e.errorMessage,
        });
    } else {
        const { message: content, message: key } = e as Error;
        void message.error({ content, key });
    }
};
