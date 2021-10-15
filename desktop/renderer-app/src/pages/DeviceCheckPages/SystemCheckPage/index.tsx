import "./index.less";
import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import os from "os";
import { routeConfig } from "../../../route-config";
import { useRTCEngine } from "../../../utils/hooks/use-rtc-engine";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { DeviceCheckResults, DeviceCheckState } from "../utils";
import { useTranslation } from "react-i18next";

export const SystemCheckPage = (): React.ReactElement => {
    const { t } = useTranslation();
    const [networkSituation, setNetworkSituation] = useState(0);
    const rtcEngine = useRTCEngine();
    const resultRef = React.useRef<DeviceCheckState>();
    const history = useHistory<DeviceCheckResults>();
    const location = useLocation<DeviceCheckResults | undefined>();

    const networkDescription = [
        t("network-status.testing"),
        t("network-status.network-quality-unknown"),
        t("network-status.network-quality-excellent"),
        t("network-status.network-quality-good"),
        t("network-status.network-quality-average"),
        t("network-status.network-quality-poor"), // 5
        t("network-status.network-quality-very-poor"), // 6
        t("network-status.network-connection-disconnected"), // 7
    ];

    const cpuModel = os.cpus()[0].model;
    const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2);

    useEffect(() => {
        const onError = (e: Error): void => {
            console.error("rtc error", e);
            resultRef.current = { content: t("testing-failed"), hasError: true };
        };

        // see: https://docs.agora.io/en/Voice/API%20Reference/electron/globals.html#agoranetworkquality
        const onLastMileQuality = (quality: number): void => {
            setNetworkSituation(quality + 1);
        };

        rtcEngine.on("error", onError);
        rtcEngine.on("lastMileQuality", onLastMileQuality);

        rtcEngine.startLastmileProbeTest({
            expectedDownlinkBitrate: 100000,
            expectedUplinkBitrate: 100000,
            probeDownlink: true,
            probeUplink: true,
        });

        return () => {
            rtcEngine.off("error", onError);
            rtcEngine.off("lastMileQuality", onLastMileQuality);
            rtcEngine.stopLastmileProbeTest();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (networkSituation >= 5) {
            resultRef.current = { content: networkDescription[networkSituation], hasError: true };
        } else {
            resultRef.current = { content: "", hasError: false };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkSituation]);

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
                    <span>{networkDescription[networkSituation]}</span>
                </div>
            </div>
            <Button type="primary" onClick={historyPush}>
                {t("next-step")}
            </Button>
        </DeviceCheckLayoutContainer>
    );
};
