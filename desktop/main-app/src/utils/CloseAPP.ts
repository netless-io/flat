import { app } from "electron";

const closeAPP = (): void => {
    app.exit(0);
};

export default closeAPP;
