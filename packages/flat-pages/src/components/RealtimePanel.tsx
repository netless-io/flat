import React, { ReactElement } from "react";
import classNames from "classnames";

import "./RealtimePanel.less";
import { ClassroomStore } from "@netless/flat-stores";
import { SidebarHandler } from "./SidebarHandle";

export type RealtimePanelProps = {
    // is playing user video
    isVideoOn: boolean;
    // is visible
    isShow: boolean;
    videoSlot?: React.ReactNode;
    chatSlot: React.ReactNode;
    classroom: ClassroomStore;
};

export class RealtimePanel extends React.PureComponent<RealtimePanelProps> {
    public override render(): ReactElement {
        const { isVideoOn, isShow, videoSlot, chatSlot, classroom } = this.props;

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
                {!classroom.isAIRoom && <SidebarHandler classroom={classroom} />}
            </div>
        );
    }
}

export default RealtimePanel;
