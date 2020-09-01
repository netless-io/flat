import * as React from "react";
import loading from "./assets/image/loading.svg";
import "./LoadingPage.less";
import { RoomPhase } from "white-web-sdk";
export type LoadingPageProps = {
    phase: RoomPhase;
};

export default class LoadingPage extends React.Component<LoadingPageProps, {}> {
    private renderScript = (): React.ReactNode => {
        const { phase } = this.props;
        switch (phase) {
            case RoomPhase.Reconnecting: {
                return <div>Reconnecting</div>;
            }
            case RoomPhase.Disconnected: {
                return <div>Disconnected</div>;
            }
            case RoomPhase.Connected: {
                return <div>Connected</div>;
            }
            case RoomPhase.Connecting: {
                return <div>Connecting</div>;
            }
            case RoomPhase.Disconnecting: {
                return <div>Disconnecting</div>;
            }
            default: {
                return <div>Connected</div>;
            }
        }
    };
    public render(): React.ReactNode {
        return (
            <div className="white-board-loading">
                <div className="white-board-loading-mid">
                    <img src={loading} />
                    {this.renderScript()}
                </div>
            </div>
        );
    }
}
