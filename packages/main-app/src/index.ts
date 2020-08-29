import bootstrap from "./utils/BootupFlow";
import intEnv from "./bootup/Init-env";
import initWindow from "./bootup/Init-window";
import initMenus from "./bootup/Init-menus";
import intIPC from "./bootup/Init-ipc";
import initAppListen from "./bootup/Init-app-listener";
import initOtherListeners from "./bootup/Init-other";

void bootstrap({} as Context, [
    intEnv,
    initWindow,
    initMenus,
    intIPC,
    initAppListen,
    initOtherListeners,
]);
