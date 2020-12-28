import React from "react";
import { message } from "antd";
import classNames from "classnames";
import { RoomPhase, ViewMode } from "white-web-sdk";

import PageError from "../../PageError";
import LoadingPage from "../../LoadingPage";

import InviteButton from "../../components/InviteButton";
import { TopBar, TopBarDivider } from "../../components/TopBar";
import { TopBarClassOperations } from "../../components/TopBarClassOperations";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { BigClassAvatar, VideoType } from "./BigClassAvatar";
import { NetworkStatus } from "../../components/NetworkStatus";
import { RecordButton } from "../../components/RecordButton";
import { ClassStatus } from "../../components/ClassStatus";
import { withWhiteboardRoute, WithWhiteboardRouteProps } from "../../components/Whiteboard";
import { withRtcRoute, WithRtcRouteProps } from "../../components/Rtc";
import { withRtmRoute, WithRtmRouteProps } from "../../components/Rtm";

import { getRoom, Identity } from "../../utils/localStorage/room";
import { ipcAsyncByMain } from "../../utils/ipc";

import "./BigClassPage.less";
import { RtcChannelType } from "../../apiMiddleware/Rtc";

export type BigClassPageState = {
    isRealtimeSideOpen: boolean;
    isClassBegin: boolean;
    speakingJoiner: string | null;
    mainSpeaker: string | null;
};

export type BigClassPageProps = WithWhiteboardRouteProps & WithRtcRouteProps & WithRtmRouteProps;

class BigClassPage extends React.Component<BigClassPageProps, BigClassPageState> {
    public constructor(props: BigClassPageProps) {
        super(props);

        this.state = {
            isRealtimeSideOpen: true,
            isClassBegin: false,
            speakingJoiner: null,
            mainSpeaker: null,
        };

        this.props.rtm.bindOnSpeak(this.onJoinerSpeak);

        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 700,
        });

        const room = getRoom(props.match.params.uuid);
        if (room?.roomName) {
            document.title = room.roomName;
        }
    }

    public render(): React.ReactNode {
        const { room, phase } = this.props.whiteboard;

        if (room === null || room === undefined) {
            return <LoadingPage />;
        }

        switch (phase) {
            case RoomPhase.Connecting ||
                RoomPhase.Disconnecting ||
                RoomPhase.Reconnecting ||
                RoomPhase.Reconnecting: {
                return <LoadingPage />;
            }
            case RoomPhase.Disconnected: {
                return <PageError />;
            }
            default: {
                return this.renderWhiteBoard();
            }
        }
    }

    private handleRoomController = (): void => {
        const { room } = this.props.whiteboard;
        if (!room) {
            return;
        }
        if (room.state.broadcastState.mode !== ViewMode.Broadcaster) {
            room.setViewMode(ViewMode.Broadcaster);
            message.success("其他用户将跟随您的视角");
        } else {
            room.setViewMode(ViewMode.Freedom);
            message.success("其他用户将停止跟随您的视角");
        }
    };

    private handleSideOpenerSwitch = (): void => {
        this.setState(state => ({ isRealtimeSideOpen: !state.isRealtimeSideOpen }));
    };

    private onVideoAvatarExpand = (): void => {
        this.setState(state => ({
            mainSpeaker:
                state.mainSpeaker === this.props.rtc.creatorUid
                    ? state.speakingJoiner
                    : this.props.rtc.creatorUid,
        }));
    };

    private onJoinerSpeak = (uid: string, speak: boolean): void => {
        this.setState(
            speak
                ? { speakingJoiner: uid, mainSpeaker: uid }
                : { speakingJoiner: null, mainSpeaker: null },
            () => {
                const { userId } = this.props.match.params;
                if (userId === uid) {
                    if (speak) {
                        const { rtcEngine, channelType } = this.props.rtc.rtc;
                        if (channelType === RtcChannelType.broadcast) {
                            rtcEngine.setClientRole(speak ? 1 : 2);
                        }
                    }
                }
            },
        );
    };

    private toggleCalling = (): void => {
        this.props.rtc.toggleCalling(() => {
            if (this.props.rtc.isCalling) {
                this.setState({ isRealtimeSideOpen: true });
            }
        });
    };

    private openReplayPage = () => {
        // @TODO 打开到当前的录制记录中
        const { uuid, identity, userId } = this.props.match.params;
        this.props.history.push(`/replay/${identity}/${uuid}/${userId}/`);
    };

    private renderWhiteBoard(): React.ReactNode {
        return (
            <div className="realtime-box">
                <TopBar
                    left={this.renderTopBarLeft()}
                    center={this.renderTopBarCenter()}
                    right={this.renderTopBarRight()}
                />
                <div className="realtime-content">
                    {this.props.whiteboard.whiteboardElement}
                    {this.renderRealtimePanel()}
                </div>
            </div>
        );
    }

    private renderTopBarLeft(): React.ReactNode {
        const { identity } = this.props.match.params;
        const { isClassBegin } = this.state;
        return (
            <>
                <NetworkStatus />
                {identity === Identity.joiner && <ClassStatus isClassBegin={isClassBegin} />}
            </>
        );
    }

    private renderTopBarCenter(): React.ReactNode {
        const { identity } = this.props.match.params;
        const { isClassBegin } = this.state;

        return identity === Identity.creator ? (
            <TopBarClassOperations
                isBegin={isClassBegin}
                // @TODO 实现上课逻辑
                onBegin={() => this.setState({ isClassBegin: true })}
                onPause={() => this.setState({ isClassBegin: false })}
                onStop={() => this.setState({ isClassBegin: false })}
            />
        ) : null;
    }

    private renderTopBarRight(): React.ReactNode {
        const { viewMode, toggleDocCenter } = this.props.whiteboard;
        const { isCalling, isRecording, toggleRecording } = this.props.rtc;
        const { isRealtimeSideOpen } = this.state;
        const { uuid } = this.props.match.params;

        return (
            <>
                <RecordButton
                    // @TODO 待填充逻辑
                    disabled={false}
                    isRecording={isRecording}
                    onClick={() => toggleRecording()}
                />
                <TopBarRightBtn
                    title="Call"
                    icon="phone"
                    active={isCalling}
                    onClick={this.toggleCalling}
                />
                <TopBarRightBtn
                    title="Vision control"
                    icon="follow"
                    active={viewMode === ViewMode.Broadcaster}
                    onClick={this.handleRoomController}
                />
                <TopBarRightBtn title="Docs center" icon="folder" onClick={toggleDocCenter} />
                <InviteButton uuid={uuid} />
                {/* @TODO */}
                <TopBarRightBtn title="Options" icon="options" onClick={() => {}} />
                <TopBarDivider />
                <TopBarRightBtn
                    title="Open side panel"
                    icon="hide-side"
                    active={isRealtimeSideOpen}
                    onClick={this.handleSideOpenerSwitch}
                />
            </>
        );
    }

    private renderRealtimePanel(): React.ReactNode {
        const { uuid, userId, identity } = this.props.match.params;
        const { isCalling, creatorUid, rtc } = this.props.rtc;

        const { isRealtimeSideOpen, speakingJoiner, mainSpeaker } = this.state;

        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={isCalling}
                videoSlot={
                    isCalling &&
                    creatorUid && (
                        <div className="whiteboard-rtc-box">
                            <div
                                className={classNames("whiteboard-rtc-avatar", {
                                    "is-small": mainSpeaker !== null && mainSpeaker !== creatorUid,
                                })}
                            >
                                <BigClassAvatar
                                    uid={creatorUid}
                                    type={
                                        creatorUid === userId ? VideoType.local : VideoType.remote
                                    }
                                    rtcEngine={rtc.rtcEngine}
                                    small={mainSpeaker !== null && mainSpeaker !== creatorUid}
                                    onExpand={this.onVideoAvatarExpand}
                                />
                            </div>
                            {speakingJoiner !== null && (
                                <div
                                    className={classNames("whiteboard-rtc-avatar", {
                                        "is-small": mainSpeaker !== speakingJoiner,
                                    })}
                                >
                                    <BigClassAvatar
                                        uid={speakingJoiner}
                                        type={
                                            speakingJoiner === userId
                                                ? VideoType.local
                                                : VideoType.remote
                                        }
                                        rtcEngine={rtc.rtcEngine}
                                        small={mainSpeaker !== speakingJoiner}
                                        onExpand={this.onVideoAvatarExpand}
                                    />
                                </div>
                            )}
                        </div>
                    )
                }
                chatSlot={
                    <ChatPanel
                        userId={userId}
                        channelId={uuid}
                        identity={identity}
                        rtm={this.props.rtm}
                    ></ChatPanel>
                }
            />
        );
    }
}

export default withWhiteboardRoute(
    withRtcRoute({
        recordingConfig: {
            channelType: RtcChannelType.broadcast,
            transcodingConfig: {
                width: 288,
                height: 216,
                // https://docs.agora.io/cn/cloud-recording/recording_video_profile
                fps: 15,
                bitrate: 280,
            },
            subscribeUidGroup: 0,
        },
    })(withRtmRoute(BigClassPage)),
);
