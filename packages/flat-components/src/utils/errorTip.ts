import { message } from "antd";
import { isServerRequestError } from "@netless/flat-server-api";
import { FlatI18n } from "@netless/flat-i18n";

export const errorTips = (e: unknown): void => {
    if (process.env.NODE_ENV === "development") {
        console.error(e);
    }

    if (isServerRequestError(e)) {
        void message.error({
            content: FlatI18n.t(e.errorMessage),
            key: e.errorMessage,
        });
    } else {
        const { message: content, message: key } = e as Error;
        void message.error({ content, key });
    }
};
