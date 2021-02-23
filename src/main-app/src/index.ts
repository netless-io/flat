import bootstrap from "./utils/BootupFlow";
import initWindow from "./bootup/Init-window";
import initWebRequest from "./bootup/Init-webRequest";
import initMenus from "./bootup/Init-menus";
import intIPC from "./bootup/Init-ipc";
import initAppListen from "./bootup/Init-app-listener";
import initOtherListeners from "./bootup/Init-other";

void bootstrap([initWindow, initMenus, intIPC, initAppListen, initOtherListeners, initWebRequest]);
