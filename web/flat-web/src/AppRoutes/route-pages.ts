import { ComponentType } from "react";
import { RouteNameType } from "../route-config";

export type RoutePages = {
    readonly [key in RouteNameType]: {
        readonly title: string;
        readonly component: () => Promise<{ default: ComponentType<any> }>;
    };
};

/**
 * NOTE: If you see error from "loadable-component", the real error
 *       message may be hidden by `import()` below. You can change
 *       `import("../pages/SomePage")` to
 *       `Promise.resolve({ default: SomePage })` to see the real error.
 */
export const routePages: RoutePages = {
    [RouteNameType.LoginPage]: {
        title: "Flat Login",
        component: () => import("../pages/LoginPage"),
    },
    [RouteNameType.HomePage]: {
        title: "Flat",
        component: () => import("../pages/HomePage"),
    },
    [RouteNameType.BigClassPage]: {
        title: "BigClassPage",
        component: () => import("../pages/BigClassPage"),
    },
    [RouteNameType.SmallClassPage]: {
        title: "SmallClassPage",
        component: () => import("../pages/SmallClassPage"),
    },
    [RouteNameType.OneToOnePage]: {
        title: "OneToOnePage",
        component: () => import("../pages/OneToOnePage"),
    },
    [RouteNameType.RoomDetailPage]: {
        title: "RoomDetailPage",
        component: () => import("../pages/RoomDetailPage"),
    },
    [RouteNameType.PeriodicRoomDetailPage]: {
        title: "PeriodicRoomDetailPage",
        component: () => import("../pages/PeriodicRoomDetailPage"),
    },
    [RouteNameType.UserScheduledPage]: {
        title: "UserScheduledPage",
        component: () => import("../pages/UserScheduledPage"),
    },
    [RouteNameType.ModifyOrdinaryRoomPage]: {
        title: "ModifyOrdinaryRoomPage",
        component: () => import("../pages/ModifyOrdinaryRoomPage"),
    },
    [RouteNameType.ModifyPeriodicRoomPage]: {
        title: "ModifyPeriodicRoomPage",
        component: () => import("../pages/ModifyPeriodicRoomPage"),
    },
    [RouteNameType.ReplayPage]: {
        title: "ReplayPage",
        component: () => import("../pages/ReplayPage"),
    },
    [RouteNameType.SystemCheckPage]: {
        title: "SystemCheckPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.GeneralSettingPage]: {
        title: "GeneralSettingPage",
        component: () => import("../pages/UserSettingPage/GeneralSettingPage"),
    },
    [RouteNameType.HotKeySettingPage]: {
        title: "HotKeySettingPage",
        component: () => import("../pages/UserSettingPage/HotKeySettingPage"),
    },
    [RouteNameType.AboutPage]: {
        title: "AboutPage",
        component: () => import("../pages/UserSettingPage/AboutPage"),
    },
    [RouteNameType.CloudStoragePage]: {
        title: "CloudStoragePage",
        component: () => import("../pages/CloudStoragePage"),
    },
};
