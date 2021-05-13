import "./style.less";
import signal0SVG from "./icons/signal-0.svg";
import signal1SVG from "./icons/signal-1.svg";
import signal2SVG from "./icons/signal-2.svg";
import signal3SVG from "./icons/signal-3.svg";

import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";

interface NetworkQuality {
    delay: number;
    uplink: number;
    downlink: number;
}

function getSignalIcon({ uplink, downlink }: NetworkQuality): string {
    if (uplink === 5 || downlink === 5 || uplink === 4 || downlink === 4) {
        return signal1SVG;
    }
    if (uplink === 3 || downlink === 3) {
        return signal2SVG;
    }
    if (uplink === 2 || downlink === 2 || uplink === 1 || downlink === 1) {
        return signal3SVG;
    }
    if (uplink === 8 || downlink === 8) {
        // checking
        return signal3SVG;
    }
    return signal0SVG;
}

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

function getSignalText({ uplink, downlink }: NetworkQuality): string {
    return `上行：${signalLocale[uplink]}，下行：${signalLocale[downlink]}`;
}

export interface NetworkStatusProps {
    networkQuality: NetworkQuality;
}

export const NetworkStatus = observer<NetworkStatusProps>(function NetworkStatus({
    networkQuality,
}) {
    const signalIcon = useMemo(() => getSignalIcon(networkQuality), [networkQuality]);
    const signalText = useMemo(() => getSignalText(networkQuality), [networkQuality]);
    return (
        <div className="network-status">
            <span className="network-status-delay" title="客户端到边缘服务器的网络延迟">
                延迟：<span className="network-status-delay-ms">{networkQuality.delay}ms</span>
            </span>
            <span className="network-status-signal" title={signalText}>
                网络：
                <img src={signalIcon} alt={signalText} />
            </span>
        </div>
    );
});
