import { ComponentType } from "react";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./LoginPage";
import BigClassPage from "./pages/BigClassPage";
import { ScheduleRoomDetailPage } from "./pages/ScheduleRoomPage";
import SmallClassPage from "./pages/SmallClassPage";
import OneToOnePage from "./pages/OneToOnePage";
import ReplayPage from "./pages/ReplayPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import HomePage from "./pages/HomePage";
import UserInfoPage from "./UserInfoPage";
import UserScheduledPage from "./pages/UserScheduledPage";
import UserSettingPage from "./pages/UserSettingPanel";
import { ModifyOrdinaryRoomPage } from "./pages/ModifyOrdinaryRoomPage";
import { ModifyPeriodicRoomPage } from "./pages/ModifyPeriodicRoomPage";
import { RoomType } from "./apiMiddleware/flatServer/constants";

export enum RouteNameType {
    SplashPage = "SplashPage",
    LoginPage = "LoginPage",
    HomePage = "HomePage",
    SmallClassPage = "SmallClassPage",
    BigClassPage = "BigClassPage",
    OneToOnePage = "OneToOnePage",
    RoomDetailPage = "RoomDetailPage",
    UserScheduledPage = "UserScheduledPage",
    ScheduleRoomDetailPage = "ScheduleRoomDetailPage",
    UserInfoPage = "UserInfoPage",
    UserSettingPage = "UserSettingPage",
    ReplayPage = "ReplayPage",
    ModifyOrdinaryRoomPage = "ModifyOrdinaryRoomPage",
    ModifyPeriodicRoomPage = "ModifyPeriodicRoomPage",
}

export const routeConfig = {
    [RouteNameType.SplashPage]: {
        title: "Flat",
        path: "/",
        component: SplashPage,
    },
    [RouteNameType.LoginPage]: {
        title: "Flat",
        path: "/login/",
        component: LoginPage,
    },
    [RouteNameType.HomePage]: {
        title: "Flat",
        path: "/user/",
        component: HomePage,
    },
    [RouteNameType.SmallClassPage]: {
        title: "小班课",
        path: "/classroom/SmallClass/:roomUUID/:ownerUUID/",
        component: SmallClassPage,
    },
    [RouteNameType.OneToOnePage]: {
        title: "一对一",
        path: "/classroom/OneToOne/:roomUUID/:ownerUUID/",
        component: OneToOnePage,
    },
    [RouteNameType.BigClassPage]: {
        title: "大班课",
        path: "/classroom/BigClass/:roomUUID/:ownerUUID/",
        component: BigClassPage,
    },
    [RouteNameType.RoomDetailPage]: {
        title: "房间详情",
        path: "/user/room/:roomUUID/:periodicUUID?/",
        component: RoomDetailPage,
    },
    [RouteNameType.UserScheduledPage]: {
        title: "预定房间",
        path: "/user/scheduled/",
        component: UserScheduledPage,
    },

    [RouteNameType.ScheduleRoomDetailPage]: {
        title: "周期性房间详情",
        path: "/user/scheduled/info/:periodicUUID",
        component: ScheduleRoomDetailPage,
    },
    [RouteNameType.UserInfoPage]: {
        title: "Flat",
        path: "/info/:testParams",
        component: UserInfoPage,
    },
    [RouteNameType.UserSettingPage]: {
        title: "Flat",
        path: "/setting/:settingType/",
        component: UserSettingPage,
    },
    [RouteNameType.ReplayPage]: {
        title: "房间回放",
        path: "/replay/:roomType/:roomUUID/:ownerUUID/",
        component: ReplayPage,
    },
    [RouteNameType.ModifyOrdinaryRoomPage]: {
        title: "修改房间",
        path: "/modify/:roomUUID/:periodicUUID?/",
        component: ModifyOrdinaryRoomPage,
    },
    [RouteNameType.ModifyPeriodicRoomPage]: {
        title: "修改周期性房间",
        path: "/modify/periodic/room/:periodicUUID/",
        component: ModifyPeriodicRoomPage,
    },
} as const;

export type ExtraRouteConfig = {
    [RouteNameType.ReplayPage]: {
        roomType: RoomType;
    };
    [RouteNameType.UserSettingPage]: {
        settingType: SettingPageType;
    };
};

export enum SettingPageType {
    Normal = "normal",
    Room = "room",
    Hotkey = "hotkey",
    File = "file",
    System = "system",
    Camera = "camera",
    Speaker = "speaker",
    Microphone = "microphone",
}

type CheckRouteConfig<
    T extends {
        [name in RouteNameType]: {
            title: string;
            path: string;
            component: ComponentType<any>;
        };
    }
> = T;

export type RouteConfig = CheckRouteConfig<typeof routeConfig>;
