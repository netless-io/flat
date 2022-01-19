import intAppIPC from "./bootup/init-app-ipc";
import initAppListen from "./bootup/init-app-listener";
import initEnv from "./bootup/init-env";
import initMenus from "./bootup/init-menus";
import initOtherListeners from "./bootup/init-other";
import initURLProtocol from "./bootup/init-url-protocol";
import initWebRequest from "./bootup/init-webRequest";
import initWindow from "./bootup/init-window";
import bootstrap from "./utils/bootup-flow";

void bootstrap([
    initEnv,
    initURLProtocol,
    intAppIPC,
    initWindow,
    initMenus,
    initAppListen,
    initOtherListeners,
    initWebRequest,
]);
