import "./style.less";
import signal0SVG from "./icons/signal-0.svg";
import signal1SVG from "./icons/signal-1.svg";
import signal2SVG from "./icons/signal-2.svg";
import signal3SVG from "./icons/signal-3.svg";

import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";

const SignalSVG = [signal0SVG, signal1SVG, signal2SVG, signal3SVG];

interface NetworkQuality {
    delay: number;
    uplink: number;
    downlink: number;
}

function getSignalKind(uplink: number, downlink: number): 0 | 1 | 2 | 3 {
    if (uplink === 5 || downlink === 5 || uplink === 4 || downlink === 4) {
        return 1;
    }
    if (uplink === 3 || downlink === 3) {
        return 2;
    }
    if (uplink === 2 || downlink === 2 || uplink === 1 || downlink === 1) {
        return 3;
    }
    if (uplink === 8 || downlink === 8) {
        // checking
        return 3;
    }
    return 0;
}

function getSignalIcon(uplink: number, downlink: number): string {
    return SignalSVG[getSignalKind(uplink, downlink)];
}

export interface NetworkStatusProps {
    networkQuality: NetworkQuality;
}

export const NetworkStatus = /* @__PURE__ */ observer<NetworkStatusProps>(function NetworkStatus({
    networkQuality,
}) {
    const t = useTranslate();
    const { uplink, downlink } = networkQuality;

    const signalIcon = useMemo(() => getSignalIcon(uplink, downlink), [uplink, downlink]);

    const signalText = useMemo(
        () =>
            t("network-quality", {
                uplink: t(`network-quality${uplink}`),
                downlink: t(`network-quality${downlink}`),
            }),
        [t, uplink, downlink],
    );

    const networkText = useMemo(
        () => t(`network-signal${getSignalKind(uplink, downlink)}`),
        [t, uplink, downlink],
    );

    return (
        <div className="network-status">
            <img
                alt={signalText}
                className="network-status-signal-img"
                draggable={false}
                src={signalIcon}
            />
            <div className="network-status-popover">
                <span
                    className="network-status-delay"
                    title={t("client-to-edge-server-network-latency")}
                >
                    {t("delay")}
                    <span className="network-status-delay-ms">{networkQuality.delay}ms</span>
                </span>
                <span className="network-status-signal">
                    {t("network")}
                    <span
                        className={
                            "network-status-signal-text network-status-signal-" +
                            getSignalKind(uplink, downlink)
                        }
                    >
                        {networkText}
                    </span>
                </span>
            </div>
        </div>
    );
});
