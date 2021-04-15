import "./index.less";
import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import os from "os";
import { routeConfig } from "../../../route-config";
import { useRTCEngine } from "../../../utils/hooks/useRTCEngine";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { DeviceCheckResults, DeviceCheckState } from "../utils";

export const SystemCheckPage = (): React.ReactElement => {
    const [networkSituation, setNetworkSituation] = useState(0);
    const rtcEngine = useRTCEngine();
    const resultRef = React.useRef<DeviceCheckState>();
    const history = useHistory<DeviceCheckResults>();
    const location = useLocation<DeviceCheckResults | undefined>();

    const networkDescription = [
        "正在检测...",
        "网络质量未知",
        "网络质量极好",
        "网络质量优秀",
        "网络质量一般",
        "网络质量较差", // 5
        "网络质量非常差", // 6
        "网络连接已断开", // 7
    ];

    const cpuModel = os.cpus()[0].model;
    const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2);

    useEffect(() => {
        const onError = (e: Error): void => {
            console.error("rtc error", e);
            resultRef.current = { content: "检测失败", hasError: true };
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
                <div className="system-check-inner-left">
                    <span>处理器 (CPU)</span>
                    <span>缓存可用空间</span>
                    <span>网络质量情况</span>
                </div>
                <div className="system-check-inner-right">
                    <span>{cpuModel}</span>
                    <span>{freeMemory} MB</span>
                    <span>{networkDescription[networkSituation]}</span>
                </div>
            </div>
            <Button type="primary" onClick={historyPush}>
                下一步
            </Button>
        </DeviceCheckLayoutContainer>
    );
};
