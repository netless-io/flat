import * as React from "react";
import classNames from "classnames";
import memoizeOne from "memoize-one";
import { LocalStorageRoomDataType } from "../HistoryPage";
import ChatPanel from "./ChatPanel";

import "./RealtimePanel.less";

export type RealtimePanelProps = {
    userId: string;
    channelId: string;
    // is playing user video
    isVideoOn: boolean;
    // is visible
    isShow: boolean;
    // visibility changed
    onSwitch: () => void;
    video: React.ReactNode;
};

export class RealtimePanel extends React.PureComponent<RealtimePanelProps> {
    render() {
        const { userId, channelId, isVideoOn, isShow, onSwitch, video } = this.props;

        return (
            <div
                className={classNames("realtime-panel-wrap", {
                    isActive: isShow,
                })}
            >
                <div className="realtime-panel">
                    <div
                        className={classNames("realtime-panel-video-wrap", {
                            isActive: isVideoOn,
                        })}
                    >
                        {video}
                    </div>
                    <ChatPanel
                        userId={userId}
                        channelId={channelId}
                        isRoomOwner={this.isRoomOwner(channelId)}
                        className="realtime-panel-messaging"
                    ></ChatPanel>
                </div>
                <button className="realtime-panel-side-handle" onClick={onSwitch}></button>
            </div>
        );
    }

    private isRoomOwner = memoizeOne((channelId: string): boolean => {
        const rooms = localStorage.getItem("rooms");
        if (rooms) {
            const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
            const room = roomArray.find(data => data.uuid === channelId);
            return Boolean(room?.isRoomOwner);
        }
        return false;
    });
}

export default RealtimePanel;
