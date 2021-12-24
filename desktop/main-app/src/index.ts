import bootstrap from "./utils/bootup-flow";
import initEnv from "./bootup/init-env";
import initWindow from "./bootup/init-window";
import initWebRequest from "./bootup/init-webRequest";
import initMenus from "./bootup/init-menus";
import intAppIPC from "./bootup/init-app-ipc";
import initAppListen from "./bootup/init-app-listener";
import initOtherListeners from "./bootup/init-other";
import initURLProtocol from "./bootup/init-url-protocol";

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
