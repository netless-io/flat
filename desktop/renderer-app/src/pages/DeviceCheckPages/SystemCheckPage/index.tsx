import "./index.less";
import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { routeConfig } from "../../../route-config";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { DeviceCheckResults, DeviceCheckState } from "../utils";
import { useTranslate } from "@netless/flat-i18n";
import { IServiceVideoChatNetworkQualityType } from "@netless/flat-services";
import { withFlatServices } from "@netless/flat-pages/src/components/FlatServicesContext";

const networkDescription = [
    "network-quality-unknown",
    "network-quality-excellent",
    "network-quality-good",
    "network-quality-average",
    "network-quality-poor",
    "network-quality-very-poor",
    "network-connection-disconnected",
    "network-connection-errored",
    "testing",
];

export const SystemCheckPage = withFlatServices("videoChat")(({
    videoChat: rtc,
}): React.ReactElement => {
    const t = useTranslate();
    const [networkSituation, setNetworkSituation] =
        useState<IServiceVideoChatNetworkQualityType>(8);
    const resultRef = React.useRef<DeviceCheckState>();
    const history = useHistory<DeviceCheckResults>();
    const location = useLocation<DeviceCheckResults | undefined>();

    const cpuModel = window.node.os.cpus()[0].model;
    const freeMemory = (window.node.os.freemem() / 1024 / 1024).toFixed(2);

    useEffect(() => {
        const onError = (e: Error): void => {
            console.error("rtc error", e);
            resultRef.current = { content: t("testing-failed"), hasError: true };
        };

        rtc.events.on("error", onError);
        rtc.events.on("network-test", setNetworkSituation);

        rtc.startNetworkTest();

        return () => {
            rtc.events.off("error", onError);
            rtc.events.off("network-test", setNetworkSituation);
            rtc.stopNetworkTest();
        };
    }, [rtc, t]);

    useEffect(() => {
        if (networkSituation >= 5 && networkSituation <= 7) {
            resultRef.current = {
                content: t(`network-status.${networkDescription[networkSituation]}`),
                hasError: true,
            };
        } else {
            resultRef.current = { content: "", hasError: false };
        }
    }, [networkSituation, t]);

    function historyPush(): void {
        history.push({
            pathname: routeConfig.CameraCheckPage.path,
            state: {
                ...location.state,
                systemCheck: resultRef.current,
            },
        });
    }

    return (
        <DeviceCheckLayoutContainer>
            <div className="system-check-container">
                <div className="system-check-item">
                    <span className="system-check-item-name">{t("cpu")}</span>
                    <span>{cpuModel}</span>
                </div>
                <div className="system-check-item">
                    <span className="system-check-item-name">
                        {t("cache-available-storage-space")}
                    </span>
                    <span>{freeMemory} MB</span>
                </div>
                <div className="system-check-item">
                    <span className="system-check-item-name">{t("network-quality-situation")}</span>
                    <span>{t(`network-status.${networkDescription[networkSituation]}`)}</span>
                </div>
            </div>
            <Button type="primary" onClick={historyPush}>
                {t("next-step")}
            </Button>
        </DeviceCheckLayoutContainer>
    );
});
