import { app } from "electron";

const closeAPP = () => {
    if (process.env.NODE_ENV === "development") {
        app.exit(100);
    } else {
        app.exit(0);
    }
};

export default closeAPP;
