import { ComponentType } from "react";
import { RouteNameType } from "../route-config";

export type RoutePages = {
    readonly [key in RouteNameType]: {
        readonly title: string;
        readonly hasHeader?: true;
        readonly component: () => Promise<{ default: ComponentType<any> }>;
    };
};

/**
 * NOTE: If you see error from "loadable-component", the real error
 *       message may be hidden by `import()` below. You can change
 *       `import("../SomePage")` to
 *       `Promise.resolve({ default: SomePage })` to see the real error.
 */
export const routePages: RoutePages = {
    [RouteNameType.LoginPage]: {
        title: "LoginPage",
        component: () => import("../LoginPage"),
    },
    [RouteNameType.HomePage]: {
        title: "HomePage",
        hasHeader: true,
        component: () => import("../HomePage"),
    },
    [RouteNameType.BigClassPage]: {
        title: "BigClassPage",
        component: () => import("../BigClassPage"),
    },
    [RouteNameType.SmallClassPage]: {
        title: "SmallClassPage",
        component: () => import("../SmallClassPage"),
    },
    [RouteNameType.OneToOnePage]: {
        title: "OneToOnePage",
        component: () => import("../OneToOnePage"),
    },
    [RouteNameType.AIPage]: {
        title: "AIPage",
        component: () => import("../AIPage"),
    },
    [RouteNameType.RoomDetailPage]: {
        title: "RoomDetailPage",
        hasHeader: true,
        component: () => import("../RoomDetailPage"),
    },
    [RouteNameType.PeriodicRoomDetailPage]: {
        title: "PeriodicRoomDetailPage",
        hasHeader: true,
        component: () => import("../PeriodicRoomDetailPage"),
    },
    [RouteNameType.UserScheduledPage]: {
        title: "UserScheduledPage",
        hasHeader: true,
        component: () => import("../UserScheduledPage"),
    },
    [RouteNameType.ModifyOrdinaryRoomPage]: {
        title: "ModifyOrdinaryRoomPage",
        hasHeader: true,
        component: () => import("../ModifyOrdinaryRoomPage"),
    },
    [RouteNameType.ModifyPeriodicRoomPage]: {
        title: "ModifyPeriodicRoomPage",
        hasHeader: true,
        component: () => import("../ModifyPeriodicRoomPage"),
    },
    [RouteNameType.ReplayPage]: {
        title: "ReplayPage",
        component: () => import("../ReplayPage"),
    },
    [RouteNameType.SystemCheckPage]: {
        title: "SystemCheckPage",
        hasHeader: true,
        component: () => Promise.resolve({ default: () => null }),
    },
    [RouteNameType.GeneralSettingPage]: {
        title: "GeneralSettingPage",
        hasHeader: true,
        component: () => import("../UserSettingPage/GeneralSettingPage"),
    },
    [RouteNameType.HotKeySettingPage]: {
        title: "HotKeySettingPage",
        hasHeader: true,
        component: () => import("../UserSettingPage/HotKeySettingPage"),
    },
    [RouteNameType.AboutPage]: {
        title: "AboutPage",
        hasHeader: true,
        component: () => import("../UserSettingPage/AboutPage"),
    },
    [RouteNameType.CloudStoragePage]: {
        title: "CloudStoragePage",
        hasHeader: true,
        component: () => import("../CloudStoragePage"),
    },
    [RouteNameType.JoinPage]: {
        title: "JoinPage",
        component: () => import("../JoinPage"),
    },
    [RouteNameType.ResourcePreviewPage]: {
        title: "ResourcePreviewPage",
        component: () => import("../ResourcePreviewPage"),
    },
    [RouteNameType.FilePreviewPage]: {
        title: "FilePreviewPage",
        component: () => import("../FilePreviewPage"),
    },
    [RouteNameType.DevicesTestPage]: {
        title: "DevicesTestPage",
        component: () => import("../DevicesTestPage"),
    },
    [RouteNameType.ApplicationsPage]: {
        title: "ApplicationsPage",
        hasHeader: true,
        component: () => import("../UserSettingPage/ApplicationsPage"),
    },
    [RouteNameType.OAuthPage]: {
        title: "OAuthPage",
        hasHeader: true,
        component: () => import("../UserSettingPage/OAuthPage"),
    },
    [RouteNameType.SensitivePage]: {
        title: "SensitivePage",
        component: () => import("../SensitivePage"),
    },
};
