/* eslint react/display-name: off */
import systemSVG from "./icons/system.svg";
import cameraSVG from "./icons/camera.svg";
import speakerSVG from "./icons/speaker.svg";
import microphoneSVG from "./icons/microphone.svg";
import "./DeviceCheckLayoutContainer.less";

import React, { useContext, useEffect } from "react";
import { routeConfig, RouteNameType } from "../../route-config";
import { useHistory, useLocation } from "react-router-dom";
import { DeviceCheckState } from "./utils";
import { MainPageLayoutItem } from "flat-components";
import { useTranslate } from "@netless/flat-i18n";

export const DeviceCheckLayoutContainer: React.FC = ({ children }): React.ReactElement => {
    useWindowSize("Main");

    const t = useTranslate();
    const history = useHistory<DeviceCheckState>();
    const location = useLocation<DeviceCheckState | undefined>();
    const pageStore = useContext(PageStoreContext);

    useEffect(() => {
        pageStore.configure({
            subMenu: [
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
            ],
            activeKeys: ["deviceCheck", location.pathname],
            onRouteChange(mainPageLayoutItem: MainPageLayoutItem) {
                history.push({
                    pathname: mainPageLayoutItem.route,
                    state: {
                        ...location.state,
                    },
                });
            },
        });
    }, [history, location.pathname, location.state, pageStore, t]);

    return <div className="device-check-layout-container">{children}</div>;
};
