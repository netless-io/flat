import React, { useEffect, useState } from "react";
import "./SystemTesting.less";
import { Button } from "antd";
import { Link } from "react-router-dom";
import os from "os";
import { useRTCEngine } from "../../utils/hooks/useRTCEngine";

export interface SystemTestingProps {
    onChange?: (description: string) => void;
}

export const SystemTesting = ({
    onChange: setNetworkDescription,
}: SystemTestingProps): React.ReactElement => {
    const [networkSituation, setNetworkSituation] = useState(0);
    const rtcEngine = useRTCEngine();

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
            setNetworkDescription?.("检测失败");
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
            setNetworkDescription?.(networkDescription[networkSituation]);
        } else {
            setNetworkDescription?.("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkSituation]);

    return (
        <div className="content-container">
            <div className="header-container">
                <span>系统检测</span>
            </div>
            <div className="system-info-container">
                <div className="system-title-info">
                    <span>处理器(CPU)</span>
                    <span>缓存可用空间</span>
                    <span>网络情况</span>
                </div>
                <div className="system-value-info">
                    <span>{cpuModel}</span>
                    <span>{freeMemory} MB</span>
                    <span>{networkDescription[networkSituation]}</span>
                    <Button type="primary">
                        <Link to="/setting/camera/">下一步</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
