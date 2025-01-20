import { ComponentType } from "react";
import { RoomDetailPage } from "@netless/flat-pages/src/RoomDetailPage";
import { HomePage } from "@netless/flat-pages/src/HomePage";
import { UserScheduledPage } from "@netless/flat-pages/src/UserScheduledPage";
import { ModifyOrdinaryRoomPage } from "@netless/flat-pages/src/ModifyOrdinaryRoomPage";
import { DevicesTestPage } from "@netless/flat-pages/src/DevicesTestPage";
import { LoginPage } from "@netless/flat-pages/src/LoginPage";
import { BigClassPage } from "@netless/flat-pages/src/BigClassPage";
import { SmallClassPage } from "@netless/flat-pages/src/SmallClassPage";
import { OneToOnePage } from "@netless/flat-pages/src/OneToOnePage";
import { AIPage } from "@netless/flat-pages/src/AIPage";
import { ModifyPeriodicRoomPage } from "@netless/flat-pages/src/ModifyPeriodicRoomPage";
import { PeriodicRoomDetailPage } from "@netless/flat-pages/src/PeriodicRoomDetailPage";
import { GeneralSettingPage } from "@netless/flat-pages/src/UserSettingPage/GeneralSettingPage";
import { HotKeySettingPage } from "@netless/flat-pages/src/UserSettingPage/HotKeySettingPage";
import { CloudStoragePage } from "@netless/flat-pages/src/CloudStoragePage";
import { CameraCheckPage } from "./pages/DeviceCheckPages/CameraCheckPage";
import { MicrophoneCheckPage } from "./pages/DeviceCheckPages/MicrophoneCheckPage";
import { SpeakerCheckPage } from "./pages/DeviceCheckPages/SpeakerCheckPage";
import { SystemCheckPage } from "./pages/DeviceCheckPages/SystemCheckPage";
import { AboutPage } from "./pages/UserSettingPage/AboutPage";
import { ReplayPage } from "@netless/flat-pages/src/ReplayPage";
import SplashPage from "./pages/SplashPage";
import { ApplicationsPage } from "@netless/flat-pages/src/UserSettingPage/ApplicationsPage";
import { OAuthPage } from "@netless/flat-pages/src/UserSettingPage/OAuthPage";
import { SensitivePage } from "@netless/flat-pages/src/SensitivePage";
import { RoomType } from "@netless/flat-server-api";

export enum RouteNameType {
    SplashPage = "SplashPage",
    LoginPage = "LoginPage",
    HomePage = "HomePage",
    SmallClassPage = "SmallClassPage",
    BigClassPage = "BigClassPage",
    OneToOnePage = "OneToOnePage",
    AIPage = "AIPage",
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
    DevicesTestPage = "DevicesTestPage",
    ApplicationsPage = "ApplicationsPage",
    OAuthPage = "OAuthPage",
    SensitivePage = "SensitivePage",
}

export type ClassRouteName =
    | RouteNameType.SmallClassPage
    | RouteNameType.OneToOnePage
    | RouteNameType.BigClassPage
    | RouteNameType.AIPage;

export const routeConfig = {
    [RouteNameType.SplashPage]: {
        title: "SplashPage",
        path: "/splash",
        component: SplashPage,
    },
    [RouteNameType.LoginPage]: {
        title: "LoginPage",
        path: "/login/",
        component: LoginPage,
    },
    [RouteNameType.HomePage]: {
        title: "HomePage",
        path: "/",
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
    [RouteNameType.AIPage]: {
        title: "AIPage",
        path: "/classroom/AIPage/:roomUUID/:ownerUUID/",
        component: AIPage,
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
    [RouteNameType.DevicesTestPage]: {
        title: "DevicesTestPage",
        path: "/devices-test/:roomUUID/",
        component: DevicesTestPage,
    },
    [RouteNameType.ApplicationsPage]: {
        title: "ApplicationsPage",
        path: "/installations/",
        component: ApplicationsPage,
    },
    [RouteNameType.OAuthPage]: {
        title: "OAuthPage",
        path: "/apps/",
        component: OAuthPage,
    },
    [RouteNameType.SensitivePage]: {
        title: "SensitivePage",
        path: "/sensitive/",
        component: SensitivePage,
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
