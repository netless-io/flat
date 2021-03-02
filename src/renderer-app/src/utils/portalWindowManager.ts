import { constants, portal } from "types-pkg";

class PortalWindowManager {
    private readonly wins: PortalWindows;

    public constructor() {
        this.wins = {};
    }

    public getClassWindow(): Window | undefined {
        return this.wins.Class;
    }

    public getReplayWindow(): Window | undefined {
        return this.wins.Replay;
    }

    public removeClassWindow(): void {
        this.wins.Class = undefined;
    }

    public removeReplayWindow(): void {
        this.wins.Replay = undefined;
    }

    public createClassPortalWindow(
        url: string,
        title: string,
        containerElement: HTMLDivElement,
    ): Window {
        this.wins.Class = this.createWindow(url, containerElement, {
            name: constants.WindowsName.Class,
            title,
            width: 1200,
            height: 700,
            disableClose: true,
        });

        return this.wins.Class;
    }

    private createWindow(
        url: string,
        containerElement: HTMLDivElement,
        feature: portal.Options,
    ): Window {
        const urlHash = new URL(url).hash;
        const featureString = JSON.stringify(feature);

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

        // if don’t do this, the image resource will fail to load
        const base = document.createElement("base");
        base.href = window.location.origin;
        portalWindow.document.head.appendChild(base);

        portalWindow.document.body.appendChild(containerElement);

        return portalWindow;
    }
}

export const portalWindowManager = new PortalWindowManager();

type PortalWindows = {
    [k in constants.WindowsName.Replay | constants.WindowsName.Class]?: Window;
};
