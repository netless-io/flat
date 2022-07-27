import { RouteNameType } from "../route-config";

export interface PageStore {
    routePathName: RouteNameType | null;
    configure: (routePathName?: string) => void;
}
