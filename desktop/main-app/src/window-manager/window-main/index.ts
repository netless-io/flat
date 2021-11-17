import { constants } from "flat-types";
import { AbstractWindow, CustomWindow } from "../abstract";
import runtime from "../../utils/runtime";
import { RxSubject } from "./rx-subject";
import { ipcMain } from "electron";
import { zip } from "rxjs";
import { ignoreElements, mergeMap } from "rxjs/operators";
import path from "path";

export class WindowMain extends AbstractWindow {
    public readonly name = constants.WindowsName.Main;
    private readonly subject: RxSubject;

    public constructor() {
        super();

        this.subject = new RxSubject();
    }

    public create(): CustomWindow {
        const customWindow = this.createWindow(
            {
                url: runtime.startURL,
                name: constants.WindowsName.Main,
                isOpenDevTools: runtime.isDevelopment,
                isPortal: false,
            },
            {
                center: true,
                ...constants.PageSize.Main,
                webPreferences: {
                    preload: runtime.preloadPath,
                },
            },
        );

        this.subject.mainWindowCreated.complete();

        this.injectAgoraSDKAddon(customWindow);

        if (process.env.NODE_ENV === "development") {
            WindowMain.loadExtensions(customWindow, "react-devtools");
        }

        return customWindow;
    }

    public async assertWindow(): Promise<CustomWindow> {
        return this.subject.mainWindowCreated.toPromise().then(() => {
            return this.win!;
        });
    }

    private static loadExtensions(win: CustomWindow, extensionName: "react-devtools"): void {
        const extPath = path.resolve(
            __dirname,
            "..",
            "..",
            "..",
            "..",
            "..",
            "third_party",
            "extensions",
            extensionName,
        );
        win.window.webContents.session.loadExtension(extPath).catch(error => {
            console.error(
                `install ${extensionName} extensions failed! error message: ${error.message}. error stack: ${error.stack}`,
            );
        });
    }

    private injectAgoraSDKAddon(win: CustomWindow): void {
        win.window.webContents.on("dom-ready", () => {
            this.subject.domReady.next("");
        });

        ipcMain.on("preload-load", event => {
            this.subject.preloadLoad.next(event);
        });

        // use the zip operator to solve the problem of not sending xx event after refreshing the page
        // don’t worry about sending multiple times, because once is used in preload.ts
        // link: https://www.learnrxjs.io/learn-rxjs/operators/combination/zip
        zip(this.subject.domReady, this.subject.preloadLoad)
            .pipe(
                mergeMap(([, event]) => {
                    event.sender.send("inject-agora-electron-sdk-addon");
                    return [];
                }),
                ignoreElements(),
            )
            .subscribe();
    }
}
