import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import signal0SVG from "./icons/signal-0.svg";
import signal1SVG from "./icons/signal-1.svg";
import signal2SVG from "./icons/signal-2.svg";
import signal3SVG from "./icons/signal-3.svg";
import "./style.less";

interface NetworkQuality {
    delay: number;
    uplink: number;
    downlink: number;
}

function getSignalIcon(uplink: number, downlink: number): string {
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

export interface NetworkStatusProps {
    networkQuality: NetworkQuality;
}

export const NetworkStatus = observer<NetworkStatusProps>(function NetworkStatus({
    networkQuality,
}) {
    const { t } = useTranslation();
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

    return (
        <div className="network-status">
            <span
                className="network-status-delay"
                title={t("client-to-edge-server-network-latency")}
            >
                {t("delay")}
                <span className="network-status-delay-ms">{networkQuality.delay}ms</span>
            </span>
            <span className="network-status-signal" title={signalText}>
                {t("network")}
                <img alt={signalText} src={signalIcon} />
            </span>
        </div>
    );
});
