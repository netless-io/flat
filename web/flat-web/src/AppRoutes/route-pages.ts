import { ComponentType } from "react";
import { RouteNameType } from "../route-config";

export type RoutePages = {
    readonly [key in RouteNameType]: {
        readonly title: string;
        readonly component: () => Promise<{ default: ComponentType<any> }>;
    };
};

export const routePages: RoutePages = {
    [RouteNameType.LoginPage]: {
        title: "Flat Login",
        component: () => import("../pages/LoginPage"),
    },
    [RouteNameType.HomePage]: {
        title: "Flat",
        component: () => import("../pages/Homepage"),
    },
};
