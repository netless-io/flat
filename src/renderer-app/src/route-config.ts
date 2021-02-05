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
}

export const routeConfig = {
    [RouteNameType.SplashPage]: {
        title: "Flat",
        path: "/",
        component: SplashPage,
    },
    [RouteNameType.LoginPage]: {
        title: "Flat Login",
        path: "/login/",
        component: LoginPage,
    },
    [RouteNameType.HomePage]: {
        title: "Flat",
        path: "/user/",
        component: HomePage,
    },
    [RouteNameType.SmallClassPage]: {
        title: "Flat Small Class",
        path: "/classroom/SmallClass/:roomUUID/:ownerUUID/",
        component: SmallClassPage,
    },
    [RouteNameType.OneToOnePage]: {
        title: "Flat Small Class",
        path: "/classroom/OneToOne/:roomUUID/:ownerUUID/",
        component: OneToOnePage,
    },
    [RouteNameType.BigClassPage]: {
        title: "Flat Big Class",
        path: "/classroom/BigClass/:roomUUID/:ownerUUID/",
        component: BigClassPage,
    },
    [RouteNameType.RoomDetailPage]: {
        title: "Flat Room Detail",
        path: "/user/room/:roomUUID/:periodicUUID?/",
        component: RoomDetailPage,
    },
    [RouteNameType.UserScheduledPage]: {
        title: "Flat Schedule Room",
        path: "/user/scheduled/",
        component: UserScheduledPage,
    },

    [RouteNameType.ScheduleRoomDetailPage]: {
        title: "Flat Scheduled Room Detail",
        path: "/user/scheduled/info/:periodicUUID",
        component: ScheduleRoomDetailPage,
    },
    [RouteNameType.UserInfoPage]: {
        title: "Flat Info",
        path: "/info/",
        component: UserInfoPage,
    },
    [RouteNameType.UserSettingPage]: {
        title: "Flat Setting",
        path: "/setting/:settingType/",
        component: UserSettingPage,
    },
    [RouteNameType.ReplayPage]: {
        title: "Flat Replay",
        path: "/replay/:roomType/:roomUUID/:ownerUUID/",
        component: ReplayPage,
    },
    [RouteNameType.ModifyOrdinaryRoomPage]: {
        title: "Flat Modify",
        path: "/modify/:roomUUID/:periodicUUID?/",
        component: ModifyOrdinaryRoomPage,
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
