import React from "react";
import signal1 from "../assets/image/signal-1.svg";
import signal2 from "../assets/image/signal-2.svg";
import signal3 from "../assets/image/signal-3.svg";
import "./NetworkStatus.less";

export interface NetworkStatusProps {
    // @TODO implement logic
}

export class NetworkStatus extends React.PureComponent<NetworkStatusProps> {
    private signal = [signal1, signal2, signal3];

    render(): React.ReactNode {
        return (
            <div className="network-status">
                <span className="network-status-delay">延迟：0ms</span>
                <span className="network-status-signal">
                    网络：
                    <img src={this.signal[2]} alt="signal" />
                </span>
            </div>
        );
    }
}

export default NetworkStatus;
