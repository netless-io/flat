import * as React from "react";
import classNames from "classnames";
import { Tabs } from "antd";

import "./RealtimePanel.less";

export type RealtimePanelProps = {
    // is playing user video
    isVideoOn: boolean;
    // is visible
    isShow: boolean;
    // visibility changed
    onSwitch: () => void;
} & (
    | {
          isReplayPage?: false;
          videoRef: React.RefObject<HTMLDivElement>;
      }
    | {
          isReplayPage: true;
          videoRef: React.RefObject<HTMLVideoElement>;
      }
);

export class RealtimePanel extends React.PureComponent<RealtimePanelProps> {
    render() {
        return (
            <div
                className={classNames("realtime-panel-wrap", {
                    isActive: this.props.isShow,
                })}
            >
                <div className="realtime-panel">
                    <div
                        className={classNames("realtime-panel-video-wrap", {
                            isActive: this.props.isVideoOn,
                        })}
                    >
                        {this.props.isReplayPage ? (
                            <video
                                className="realtime-panel-video"
                                ref={this.props.videoRef}
                            ></video>
                        ) : (
                            <div className="realtime-panel-video" ref={this.props.videoRef}></div>
                        )}
                    </div>
                    <div className="realtime-panel-messaging">
                        <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                            {/* @TODO 实现列表 */}
                            <Tabs.TabPane tab="消息列表" key="messages">
                                Content of Tab Pane 1
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="用户列表" key="users">
                                Content of Tab Pane 2
                            </Tabs.TabPane>
                        </Tabs>
                    </div>
                </div>
                <button
                    className="realtime-panel-side-handle"
                    onClick={this.props.onSwitch}
                ></button>
            </div>
        );
    }
}

export default RealtimePanel;
