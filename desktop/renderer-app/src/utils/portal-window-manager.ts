import { constants, portal } from "flat-types";
import { v4 } from "uuid";
import { ipcSyncByApp } from "./ipc";

class PortalWindowManager {
    public async createShareScreenTipPortalWindow(
        containerElement: HTMLDivElement,
        title: string,
    ): Promise<PortalWindow> {
        const shareScreenTipWindow = await this.createWindow(
            containerElement,
            {
                name: constants.WindowsName.ShareScreenTip,
            },
            title,
        );

        PortalWindowManager.patchFramelessStyle(shareScreenTipWindow);

        return shareScreenTipWindow;
    }

    public async createPreviewFilePortalWindow(
        containerElement: HTMLDivElement,
        title: string,
    ): Promise<PortalWindow> {
        return await this.createWindow(
            containerElement,
            {
                name: constants.WindowsName.PreviewFile,
            },
            title,
        );
    }

    private async createWindow(
        containerElement: HTMLDivElement,
        feature: portal.Options,
        title: string,
    ): Promise<PortalWindow> {
        const canCreateWindow = await PortalWindowManager.canCreateWindow(feature.name);
        if (!canCreateWindow) {
            throw new Error("can't create more window");
        }

        const urlHash = new URL(window.location.href).hash;
        const featureString = JSON.stringify({
            ...feature,
            // if the parameter of window.open is the same as the existing one, no new window will be created
            // it will reuse the previous window instance, but when the previous window instance is destroyed, it will raise a crash
            nonce: v4(),
        });

        const portalWindow = window.open(
            `about:blank${urlHash}`,
            `${constants.Portal}${featureString}`,
        ) as PortalWindow;

        portalWindow.document.title = title;

        // avoid being unable to use defined style
        const styles = document.querySelectorAll("style");
        const links = document.querySelectorAll("link");

        styles.forEach((ele: HTMLStyleElement) => {
            portalWindow.document.head.appendChild(ele.cloneNode(true));
        });

        links.forEach((ele: HTMLLinkElement) => {
            portalWindow.document.head.appendChild(ele.cloneNode(true));
        });

        // if we don’t do this, the image resource will fail to load
        const base = document.createElement("base");
        base.href = window.location.origin;
        portalWindow.document.head.appendChild(base);

        portalWindow.document.body.appendChild(containerElement);

        // the main process injects browserWindowID by calling executeJavaScript asynchronously.
        // so when a new window is opened, the window may not exist yet browserWindowID, and we need to wait awhile
        // it will only take about 10ms to get the value. Even at 500ms, the user experience is not bad.
        // the wait here does not block the creation of the window, only the subsequent rendering
        await new Promise<void>(r => {
            const id = setInterval(() => {
                if (portalWindow.browserWindowID) {
                    clearInterval(id);
                    r();
                }
            }, 10);
        });

        return portalWindow;
    }

    private static async canCreateWindow(windowName: constants.WindowsName): Promise<boolean> {
        return ipcSyncByApp("can-create-window", {
            windowName,
        });
    }

    // see: https://www.electronjs.org/docs/api/frameless-window#draggable-region
    private static patchFramelessStyle(portalWindow: Window): void {
        // @ts-ignore
        portalWindow.document.body.style.webkitAppRegion = "drag";

        // see: https://stackoverflow.com/a/66395289/6596777
        portalWindow.document.head.appendChild(
            Object.assign(document.createElement("style"), {
                textContent: `button {
                    -webkit-app-region: no-drag;
                }`,
            }),
        );
    }
}

export const portalWindowManager = new PortalWindowManager();
