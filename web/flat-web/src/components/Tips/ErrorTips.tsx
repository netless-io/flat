import { message } from "antd";
import { ServerRequestError } from "../../utils/error/ServerRequestError";
import { NODE_ENV } from "../../constants/Process";

export const errorTips = (e: Error): void => {
    if (NODE_ENV === "development") {
        console.error(e);
    }

    if (e instanceof ServerRequestError) {
        void message.error(e.errorMessage);
    } else {
        void message.error(e.message);
    }
};
