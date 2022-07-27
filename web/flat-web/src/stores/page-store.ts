import { routeConfig, RouteNameType } from "@netless/flat-pages/src/route-config";
import { makeAutoObservable } from "mobx";

export class PageStore {
    public routePathName: RouteNameType | null = null;

    public constructor() {
        makeAutoObservable(this);
    }

    public configure = (routePathName?: string): void => {
        console.log("route path name", routePathName);
        switch (routePathName) {
            case routeConfig[RouteNameType.HomePage].path: {
                // do something
                break;
            }
            default: {
                break;
            }
        }
    };
}

export const pageStore = new PageStore();
