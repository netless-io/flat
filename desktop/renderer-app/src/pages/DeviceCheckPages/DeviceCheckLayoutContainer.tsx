/* eslint react/display-name: off */

import React from "react";
import { MainPageLayoutItem } from "flat-components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { RouteNameType, routeConfig } from "../../route-config";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import cameraSVG from "./icons/camera.svg";
import microphoneSVG from "./icons/microphone.svg";
import speakerSVG from "./icons/speaker.svg";
import systemSVG from "./icons/system.svg";
import { DeviceCheckState } from "./utils";
import "./DeviceCheckLayoutContainer.less";

export const DeviceCheckLayoutContainer: React.FC = ({ children }): React.ReactElement => {
    useWindowSize("Main");

    const { t } = useTranslation();
    const history = useHistory<DeviceCheckState>();
    const location = useLocation<DeviceCheckState | undefined>();

    const subMenu = [
        {
            key: routeConfig[RouteNameType.SystemCheckPage].path,
            icon: (): React.ReactNode => <img src={systemSVG} />,
            title: t("system-testing"),
            route: routeConfig[RouteNameType.SystemCheckPage].path,
        },
        {
            key: routeConfig[RouteNameType.CameraCheckPage].path,
            icon: (): React.ReactNode => <img src={cameraSVG} />,
            title: t("camera-testing"),
            route: routeConfig[RouteNameType.CameraCheckPage].path,
        },
        {
            key: routeConfig[RouteNameType.SpeakerCheckPage].path,
            icon: (): React.ReactNode => <img src={speakerSVG} />,
            title: t("headphone-testing"),
            route: routeConfig[RouteNameType.SpeakerCheckPage].path,
        },
        {
            key: routeConfig[RouteNameType.MicrophoneCheckPage].path,
            icon: (): React.ReactNode => <img src={microphoneSVG} />,
            title: t("microphone-testing"),
            route: routeConfig[RouteNameType.MicrophoneCheckPage].path,
        },
    ];

    const activeKeys = ["deviceCheck", location.pathname];

    return (
        <MainPageLayoutContainer
            activeKeys={activeKeys}
            subMenu={subMenu}
            onRouteChange={(mainPageLayoutItem: MainPageLayoutItem) => {
                history.push({
                    pathname: mainPageLayoutItem.route,
                    state: {
                        ...location.state,
                    },
                });
            }}
        >
            <div className="device-check-layout-container">{children}</div>
        </MainPageLayoutContainer>
    );
};
