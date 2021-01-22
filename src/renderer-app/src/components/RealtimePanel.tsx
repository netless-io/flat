import React from "react";
import classNames from "classnames";

import "./RealtimePanel.less";

export type RealtimePanelProps = {
    // is playing user video
    isVideoOn: boolean;
    // is visible
    isShow: boolean;
    videoSlot?: React.ReactNode;
    chatSlot: React.ReactNode;
};

export class RealtimePanel extends React.PureComponent<RealtimePanelProps> {
    render(): JSX.Element {
        const { isVideoOn, isShow, videoSlot, chatSlot } = this.props;

        return (
            <div
                className={classNames("realtime-panel-wrap", {
                    isActive: isShow,
                })}
            >
                <div className="realtime-panel">
                    <div
                        className={classNames("realtime-panel-video-slot", {
                            isActive: isVideoOn,
                        })}
                    >
                        {videoSlot}
                    </div>
                    <div className="realtime-panel-chat-slot">{chatSlot}</div>
                </div>
            </div>
        );
    }
}

export default RealtimePanel;
