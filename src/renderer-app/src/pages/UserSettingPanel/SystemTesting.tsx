import React, { useEffect, useState } from "react";
import "./SystemTesting.less";
import { Button } from "antd";
import type AgoraSdk from "agora-electron-sdk";
import { Link } from "react-router-dom";
import { AGORA } from "../../constants/Process";
import os from "os";

export const SystemTesting = (): React.ReactElement => {
    const [networkSituation, setNetworkSituation] = useState(0);

    const networkDescription = [
        "正在检测...",
        "网络质量未知",
        "网络质量极好",
        "网络质量优秀",
        "网络质量一般",
        "网络质量较差",
        "网络质量非常差",
        "网络连接已断开",
    ];

    const cpuModel = os.cpus()[0].model;
    const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2);

    useEffect(() => {
        const rtcEngine: AgoraSdk = new window.AgoraRtcEngine();
        rtcEngine.initialize(AGORA.APP_ID);

        // see: https://docs.agora.io/en/Voice/API%20Reference/electron/globals.html#agoranetworkquality
        rtcEngine.on("lastMileQuality", quality => {
            setNetworkSituation(quality + 1);
        });

        rtcEngine.startLastmileProbeTest({
            expectedDownlinkBitrate: 100000,
            expectedUplinkBitrate: 100000,
            probeDownlink: true,
            probeUplink: true,
        });

        return () => {
            rtcEngine.removeAllListeners();
            rtcEngine.release();
        };
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
