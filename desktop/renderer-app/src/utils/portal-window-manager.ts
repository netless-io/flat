import { constants, portal } from "flat-types";
import { v4 } from "uuid";
import { ipcSyncByApp } from "./ipc";

class PortalWindowManager {
    public async createShareScreenTipPortalWindow(
        containerElement: HTMLDivElement,
    ): Promise<Window> {
        const shareScreenTipWindow = await this.createWindow(containerElement, {
            name: constants.WindowsName.ShareScreenTip,
        });

        PortalWindowManager.patchFramelessStyle(shareScreenTipWindow);

        return shareScreenTipWindow;
    }

    // TODO: add title params
    //  @BlackHole1
    private async createWindow(
        containerElement: HTMLDivElement,
        feature: portal.Options,
    ): Promise<Window> {
        const canCreateWindow = await PortalWindowManager.canCreateWindow(feature.name);
        if (!canCreateWindow) {
            throw new Error("can't create more window");
        }

        const urlHash = new URL(window.location.href).hash;
        const featureString = JSON.stringify({
            ...feature,
            // if the parameter of window.open is the same as the existing one, no new window will be created
            nonce: v4(),
        });

        const portalWindow = window.open(
            `about:blank${urlHash}`,
            `${constants.Portal}${featureString}`,
        )!;

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
