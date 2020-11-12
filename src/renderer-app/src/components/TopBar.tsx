import * as React from "react";
import classNames from "classnames";
import { runtime } from "../utils/Runtime";
import signal1 from "../assets/image/signal-1.svg";
import signal2 from "../assets/image/signal-2.svg";
import signal3 from "../assets/image/signal-3.svg";
import "./TopBar.less";

export interface TopBarProps {
    title: string;
    center: React.ReactNode;
    rightBtns: React.ReactNode;
}

export class TopBar extends React.PureComponent<TopBarProps> {
    private signal = [signal1, signal2, signal3];

    render() {
        return (
            <div className={classNames("topbar-box", { isMac: runtime.isMac })}>
                <div className="topbar-content-left">
                    <h1 className="topbar-title">{this.props.title}</h1>
                    {/* @TODO 网络状态 */}
                    <div className="topbar-network-status">
                        <span className="topbar-network-delay">延迟：0ms</span>
                        <span className="topbar-network-signal">
                            网络：
                            <img src={this.signal[2]} alt="signal" />
                        </span>
                    </div>
                </div>
                <div className="topbar-content-center">{this.props.center}</div>
                <div className="topbar-content-right">{this.props.rightBtns}</div>
            </div>
        );
    }
}

export default TopBar;
