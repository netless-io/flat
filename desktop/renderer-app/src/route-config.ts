import { ComponentType } from "react";
import { RoomType } from "./api-middleware/flatServer/constants";
import BigClassPage from "./pages/BigClassPage";
import { CloudStoragePage } from "./pages/CloudStoragePage";
import { CameraCheckPage } from "./pages/DeviceCheckPages/CameraCheckPage";
import { MicrophoneCheckPage } from "./pages/DeviceCheckPages/MicrophoneCheckPage";
import { SpeakerCheckPage } from "./pages/DeviceCheckPages/SpeakerCheckPage";
import { SystemCheckPage } from "./pages/DeviceCheckPages/SystemCheckPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { ModifyOrdinaryRoomPage } from "./pages/ModifyOrdinaryRoomPage";
import { ModifyPeriodicRoomPage } from "./pages/ModifyPeriodicRoomPage";
import OneToOnePage from "./pages/OneToOnePage";
import { PeriodicRoomDetailPage } from "./pages/PeriodicRoomDetailPage";
import ReplayPage from "./pages/ReplayPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import SmallClassPage from "./pages/SmallClassPage";
import SplashPage from "./pages/SplashPage";
import UserScheduledPage from "./pages/UserScheduledPage";
import { AboutPage } from "./pages/UserSettingPage/AboutPage";
import { GeneralSettingPage } from "./pages/UserSettingPage/GeneralSettingPage";
import { HotKeySettingPage } from "./pages/UserSettingPage/HotKeySettingPage";

export enum RouteNameType {
    SplashPage = "SplashPage",
    LoginPage = "LoginPage",
    HomePage = "HomePage",
    SmallClassPage = "SmallClassPage",
    BigClassPage = "BigClassPage",
    OneToOnePage = "OneToOnePage",
    RoomDetailPage = "RoomDetailPage",
    UserScheduledPage = "UserScheduledPage",
    PeriodicRoomDetailPage = "PeriodicRoomDetailPage",
    ReplayPage = "ReplayPage",
    ModifyOrdinaryRoomPage = "ModifyOrdinaryRoomPage",
    ModifyPeriodicRoomPage = "ModifyPeriodicRoomPage",
    CloudStoragePage = "CloudStoragePage",
    SystemCheckPage = "SystemCheckPage",
    CameraCheckPage = "CameraCheckPage",
    SpeakerCheckPage = "SpeakerCheckPage",
    MicrophoneCheckPage = "MicrophoneCheckPage",
    GeneralSettingPage = "GeneralSettingPage",
    HotKeySettingPage = "HotKeySettingPage",
    AboutPage = "AboutPage",
}

export type ClassRouteName =
    | RouteNameType.SmallClassPage
    | RouteNameType.OneToOnePage
    | RouteNameType.BigClassPage;

export const routeConfig = {
    [RouteNameType.SplashPage]: {
        title: "SplashPage",
        path: "/",
        component: SplashPage,
    },
    [RouteNameType.LoginPage]: {
        title: "LoginPage",
        path: "/login/",
        component: LoginPage,
    },
    [RouteNameType.HomePage]: {
        title: "HomePage",
        path: "/user/",
        component: HomePage,
    },
    [RouteNameType.SmallClassPage]: {
        title: "SmallClassPage",
        path: "/classroom/SmallClass/:roomUUID/:ownerUUID/",
        component: SmallClassPage,
    },
    [RouteNameType.OneToOnePage]: {
        title: "OneToOnePage",
        path: "/classroom/OneToOne/:roomUUID/:ownerUUID/",
        component: OneToOnePage,
    },
    [RouteNameType.BigClassPage]: {
        title: "BigClassPage",
        path: "/classroom/BigClass/:roomUUID/:ownerUUID/",
        component: BigClassPage,
    },
    [RouteNameType.RoomDetailPage]: {
        title: "RoomDetailPage",
        path: "/user/room/:roomUUID/:periodicUUID?/",
        component: RoomDetailPage,
    },
    [RouteNameType.UserScheduledPage]: {
        title: "UserScheduledPage",
        path: "/user/scheduled/",
        component: UserScheduledPage,
    },
    [RouteNameType.PeriodicRoomDetailPage]: {
        title: "PeriodicRoomDetailPage",
        path: "/user/periodic/info/:periodicUUID",
        component: PeriodicRoomDetailPage,
    },
    [RouteNameType.ReplayPage]: {
        title: "ReplayPage",
        path: "/replay/:roomType/:roomUUID/:ownerUUID/",
        component: ReplayPage,
    },
    [RouteNameType.ModifyOrdinaryRoomPage]: {
        title: "ModifyOrdinaryRoomPage",
        path: "/modify/:roomUUID/:periodicUUID?/",
        component: ModifyOrdinaryRoomPage,
    },
    [RouteNameType.ModifyPeriodicRoomPage]: {
        title: "ModifyPeriodicRoomPage",
        path: "/modify/periodic/room/:periodicUUID/",
        component: ModifyPeriodicRoomPage,
    },
    [RouteNameType.CloudStoragePage]: {
        title: "CloudStoragePage",
        path: "/pan/",
        component: CloudStoragePage,
    },
    [RouteNameType.SystemCheckPage]: {
        title: "SystemCheckPage",
        path: "/device/system/",
        component: SystemCheckPage,
    },
    [RouteNameType.CameraCheckPage]: {
        title: "CameraCheckPage",
        path: "/device/camera/",
        component: CameraCheckPage,
    },
    [RouteNameType.SpeakerCheckPage]: {
        title: "SpeakerCheckPage",
        path: "/device/speaker/",
        component: SpeakerCheckPage,
    },
    [RouteNameType.MicrophoneCheckPage]: {
        title: "MicrophoneCheckPage",
        path: "/device/microphone/",
        component: MicrophoneCheckPage,
    },
    [RouteNameType.GeneralSettingPage]: {
        title: "GeneralSettingPage",
        path: "/general-settings/",
        component: GeneralSettingPage,
    },
    [RouteNameType.HotKeySettingPage]: {
        title: "HotKeySettingPage",
        path: "/hotkey/",
        component: HotKeySettingPage,
    },
    [RouteNameType.AboutPage]: {
        title: "AboutPage",
        path: "/about/",
        component: AboutPage,
    },
} as const;

export type ExtraRouteConfig = {
    [RouteNameType.ReplayPage]: {
        roomType: RoomType;
    };
};

type CheckRouteConfig<
    T extends {
        [name in RouteNameType]: {
            title: string;
            path: string;
            component: ComponentType<any>;
        };
    },
> = T;

export type RouteConfig = CheckRouteConfig<typeof routeConfig>;
