/* eslint react/display-name: off */
import "./DeviceCheckLayoutContainer.less";

import React, { useContext, useEffect } from "react";
import { routeConfig, RouteNameType } from "../../route-config";
import { useHistory, useLocation } from "react-router-dom";
import { DeviceCheckState } from "./utils";
import { MainPageLayoutItem, SVGCamera, SVGMicrophone, SVGSound, SVGSystem } from "flat-components";
import { useTranslate } from "@netless/flat-i18n";
import { PageStoreContext } from "@netless/flat-pages/src/components/StoreProvider";

export const DeviceCheckLayoutContainer: React.FC = ({ children }): React.ReactElement => {
    const t = useTranslate();
    const history = useHistory<DeviceCheckState>();
    const location = useLocation<DeviceCheckState | undefined>();
    const pageStore = useContext(PageStoreContext);

    useEffect(() => {
        pageStore.configure({
            subMenu: [
                {
                    key: routeConfig[RouteNameType.SystemCheckPage].path,
                    icon: active => <SVGSystem active={active} />,
                    title: t("system-testing"),
                    route: routeConfig[RouteNameType.SystemCheckPage].path,
                },
                {
                    key: routeConfig[RouteNameType.CameraCheckPage].path,
                    icon: active => <SVGCamera active={active} />,
                    title: t("camera-testing"),
                    route: routeConfig[RouteNameType.CameraCheckPage].path,
                },
                {
                    key: routeConfig[RouteNameType.SpeakerCheckPage].path,
                    icon: active => <SVGSound active={active} />,
                    title: t("headphone-testing"),
                    route: routeConfig[RouteNameType.SpeakerCheckPage].path,
                },
                {
                    key: routeConfig[RouteNameType.MicrophoneCheckPage].path,
                    icon: active => <SVGMicrophone active={active} />,
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
