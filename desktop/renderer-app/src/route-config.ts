import { ComponentType } from "react";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import BigClassPage from "./pages/BigClassPage";
import { ScheduleRoomDetailPage } from "./pages/ScheduleRoomPage";
import SmallClassPage from "./pages/SmallClassPage";
import OneToOnePage from "./pages/OneToOnePage";
import ReplayPage from "./pages/ReplayPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import HomePage from "./pages/HomePage";
import UserScheduledPage from "./pages/UserScheduledPage";
import { ModifyOrdinaryRoomPage } from "./pages/ModifyOrdinaryRoomPage";
import { ModifyPeriodicRoomPage } from "./pages/ModifyPeriodicRoomPage";
import { RoomType } from "./apiMiddleware/flatServer/constants";
import { CloudStoragePage } from "./pages/CloudStoragePage";
import { CameraCheckPage } from "./pages/DeviceCheckPages/CameraCheckPage";
import { MicrophoneCheckPage } from "./pages/DeviceCheckPages/MicrophoneCheckPage";
import { SpeakerCheckPage } from "./pages/DeviceCheckPages/SpeakerCheckPage";
import { SystemCheckPage } from "./pages/DeviceCheckPages/SystemCheckPage";
import { GeneralSettingPage } from "./pages/UserSettingPage/GeneralSettingPage";
import { HotKeySettingPage } from "./pages/UserSettingPage/HotKeySettingPage";
import { FeedbackPage } from "./pages/UserSettingPage/FeedBackPage";
import { AboutPage } from "./pages/UserSettingPage/AboutPage";
import { PeriodicRoomDetailPage } from "./pages/PeriodicRoomDetailPage";

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
    FeedbackPage = "FeedbackPage",
    AboutPage = "AboutPage",
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
    [RouteNameType.PeriodicRoomDetailPage]: {
        title: "周期性房间详情",
        path: "/user/periodic/info/:periodicUUID",
        component: PeriodicRoomDetailPage,
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
    [RouteNameType.CloudStoragePage]: {
        title: "Flat",
        path: "/pan/",
        component: CloudStoragePage,
    },
    [RouteNameType.SystemCheckPage]: {
        title: "系统检测",
        path: "/device/system/",
        component: SystemCheckPage,
    },
    [RouteNameType.CameraCheckPage]: {
        title: "摄像头检测",
        path: "/device/camera/",
        component: CameraCheckPage,
    },
    [RouteNameType.SpeakerCheckPage]: {
        title: "扬声器检测",
        path: "/device/speaker/",
        component: SpeakerCheckPage,
    },
    [RouteNameType.MicrophoneCheckPage]: {
        title: "麦克风检测",
        path: "/device/microphone/",
        component: MicrophoneCheckPage,
    },
    [RouteNameType.GeneralSettingPage]: {
        title: "常规设置",
        path: "/general-settings/",
        component: GeneralSettingPage,
    },
    [RouteNameType.HotKeySettingPage]: {
        title: "热键设置",
        path: "/hotkey/",
        component: HotKeySettingPage,
    },
    [RouteNameType.FeedbackPage]: {
        title: "吐个槽",
        path: "/feedback/",
        component: FeedbackPage,
    },
    [RouteNameType.AboutPage]: {
        title: "关于我们",
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
