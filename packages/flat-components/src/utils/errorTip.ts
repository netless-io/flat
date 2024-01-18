import { message } from "antd";
import { isServerRequestError } from "@netless/flat-server-api";
import { FlatI18n } from "@netless/flat-i18n";

export const errorTips = (e: unknown): void => {
    if (process.env.NODE_ENV === "development") {
        console.error(e);
        // console.error() cannot show properties of the error object
        console.log(Object.assign({}, e));
    }

    if (isServerRequestError(e)) {
        let content = e.errorMessage
            ? FlatI18n.t(e.errorMessage)
            : FlatI18n.t("error-code-error", { code: `${e.errorCode}` });
        if (!e.errorMessage && e.serverMessage) {
            content += " (" + e.serverMessage + ")";
        }
        void message.error({ content, key: e.errorCode });
    } else if ((e as Error).message) {
        const { message: content, message: key } = e as Error;
        void message.error({ content, key });
    } else {
        void message.error({ content: FlatI18n.t("unknown-error"), key: "unknown" });
    }
};
