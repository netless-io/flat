import bootstrap from "./utils/BootupFlow";
import intEnv from "./bootup/Init-env";
import initMenus from "./bootup/Init-menus";
import initWindow from "./bootup/Init-window";
import intIPC from "./bootup/Init-ipc";
import initAppListen from "./bootup/Init-app-listener";

void bootstrap({} as Context, [intEnv, initMenus, initWindow, intIPC, initAppListen]);
