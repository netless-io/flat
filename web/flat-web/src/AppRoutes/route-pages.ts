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
        component: () => import("../pages/HomePage"),
    },
    [RouteNameType.SmallClassPage]: {
        title: "SmallClassPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.OneToOnePage]: {
        title: "OneToOnePage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.BigClassPage]: {
        title: "BigClassPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.RoomDetailPage]: {
        title: "RoomDetailPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.UserScheduledPage]: {
        title: "UserScheduledPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.PeriodicRoomDetailPage]: {
        title: "PeriodicRoomDetailPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.ReplayPage]: {
        title: "ReplayPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.ModifyOrdinaryRoomPage]: {
        title: "ModifyOrdinaryRoomPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.ModifyPeriodicRoomPage]: {
        title: "ModifyPeriodicRoomPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.SystemCheckPage]: {
        title: "SystemCheckPage",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.GeneralSettingPage]: {
        title: "Flat",
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.CloudStoragePage]: {
        title: "Flat",
        component: () => Promise.resolve({ default: () => null }),
    },
};
