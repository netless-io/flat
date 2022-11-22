import { message } from "antd";
import { isServerRequestError } from "@netless/flat-server-api";
import { FlatI18n } from "@netless/flat-i18n";

export const errorTips = (e: unknown): void => {
    if (process.env.NODE_ENV === "development") {
        console.error(e);
    }

    if (isServerRequestError(e)) {
        if (e.errorMessage) {
            void message.error({
                content: FlatI18n.t(e.errorMessage),
                key: e.errorCode,
            });
        } else {
            void message.error({
                content: FlatI18n.t("error-code-error", { code: `${e.errorCode}` }),
                key: e.errorCode,
            });
        }
    } else if ((e as Error).message) {
        const { message: content, message: key } = e as Error;
        void message.error({ content, key });
    } else {
        void message.error({ content: FlatI18n.t("unknown-error"), key: "unknown" });
    }
};
