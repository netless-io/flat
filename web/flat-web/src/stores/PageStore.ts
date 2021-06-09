import { makeAutoObservable } from "mobx";
import { MainPageLayoutHorizontalContainerProps } from "../components/MainPageLayoutHorizontalContainer";
import { RouteNameType } from "../route-config";

type DelegateProps = MainPageLayoutHorizontalContainerProps;

export class PageStore {
    public name?: RouteNameType = undefined;
    public title: DelegateProps["title"] = undefined;
    public subMenu: DelegateProps["subMenu"] = undefined;
    public activeKeys: DelegateProps["activeKeys"] = undefined;
    public onRouteChange: DelegateProps["onRouteChange"] = undefined;
    public onBackPreviousPage: DelegateProps["onBackPreviousPage"] = undefined;

    public constructor() {
        makeAutoObservable(this);
    }

    public setName(name: RouteNameType): void {
        this.name = name;
    }

    public configure(config?: DelegateProps): void {
        this.title = config?.title;
        this.subMenu = config?.subMenu;
        this.activeKeys = config?.activeKeys;
        this.onRouteChange = config?.onRouteChange;
        this.onBackPreviousPage = config?.onBackPreviousPage;
    }
}

export const pageStore = new PageStore();
