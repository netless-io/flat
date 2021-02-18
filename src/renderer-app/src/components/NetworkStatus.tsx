import signal0 from "../assets/image/signal-0.svg";
import signal1 from "../assets/image/signal-1.svg";
import signal2 from "../assets/image/signal-2.svg";
import signal3 from "../assets/image/signal-3.svg";
import "./NetworkStatus.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { useComputed } from "../utils/mobx";

const signalLocale = [
    "质量未知",
    "网络质量极好",
    "网络质量优秀",
    "网络质量一般",
    "网络质量较差",
    "网络质量非常差",
    "网络连接已断开",
    "暂时无法检测网络质量",
    "正在检测...",
];

export interface NetworkStatusProps {
    networkQuality: {
        delay: number;
        uplink: number;
        downlink: number;
    };
}

export const NetworkStatus = observer<NetworkStatusProps>(function NetworkStatus({
    networkQuality,
}) {
    const signalIcon = useComputed<string>(() => {
        const { uplink, downlink } = networkQuality;
        if (uplink === 5 || downlink === 5 || uplink === 4 || downlink === 4) {
            return signal1;
        }
        if (uplink === 3 || downlink === 3) {
            return signal2;
        }
        if (uplink === 2 || downlink === 2 || uplink === 1 || downlink === 1) {
            return signal3;
        }
        if (uplink === 8 || downlink === 8) {
            // checking
            return signal3;
        }
        return signal0;
    }).get();

    const signalText = useComputed<string>(
        () =>
            `上行：${signalLocale[networkQuality.uplink]}，下行：${
                signalLocale[networkQuality.downlink]
            }`,
    ).get();

    return (
        <div className="network-status">
            <span className="network-status-delay" title="客户端到边缘服务器的网络延迟">
                延迟：{networkQuality.delay}ms
            </span>
            <span className="network-status-signal" title={signalText}>
                网络：
                <img src={signalIcon} alt={signalText} />
            </span>
        </div>
    );
});

export default NetworkStatus;
