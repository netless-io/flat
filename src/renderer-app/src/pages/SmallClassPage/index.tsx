import React from "react";
import { message } from "antd";
import classNames from "classnames";
import { RoomPhase, ViewMode } from "white-web-sdk";

import PageError from "../../PageError";
import LoadingPage from "../../LoadingPage";

import InviteButton from "../../components/InviteButton";
import { TopBar, TopBarDivider } from "../../components/TopBar";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { VideoAvatar, VideoType } from "../../components/VideoAvatar";
import { NetworkStatus } from "../../components/NetworkStatus";
import { RecordButton } from "../../components/RecordButton";
import { ClassStatus } from "../../components/ClassStatus";
import { withWhiteboardRoute, WithWhiteboardRouteProps } from "../../components/Whiteboard";
import { withRtcRoute, WithRtcRouteProps } from "../../components/Rtc";
import { withRtmRoute, WithRtmRouteProps } from "../../components/Rtm";

import { getRoom, Identity } from "../../utils/localStorage/room";
import { ipcAsyncByMain } from "../../utils/Ipc";

import "./SmallClassPage.less";

export enum ClassModeType {
    lecture = "lecture",
    interaction = "interaction",
}

export enum ClassStatusType {
    idle,
    started,
    paused,
    stopped,
}

export type SmallClassPageState = {
    isRealtimeSideOpen: boolean;
    classStatus: ClassStatusType;
    speakingJoiner: string | null;
    mainSpeaker: string | null;
    classMode: ClassModeType;
};

export type SmallClassPageProps = WithWhiteboardRouteProps & WithRtcRouteProps & WithRtmRouteProps;

class SmallClassPage extends React.Component<SmallClassPageProps, SmallClassPageState> {
    public constructor(props: SmallClassPageProps) {
        super(props);

        this.state = {
            isRealtimeSideOpen: true,
            classStatus: ClassStatusType.idle,
            speakingJoiner: null,
            mainSpeaker: null,
            classMode: ClassModeType.lecture,
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
                        this.props.rtc.rtc.rtcEngine.setClientRole(speak ? 1 : 2);
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

    private toggleClassMode = (): void => {
        this.setState(state => ({
            classMode:
                state.classMode === ClassModeType.lecture
                    ? ClassModeType.interaction
                    : ClassModeType.lecture,
        }));
    };

    private startClass = (): void => {
        this.setState({ classStatus: ClassStatusType.started });
    };

    private pauseClass = (): void => {
        this.setState({ classStatus: ClassStatusType.paused });
    };

    private resumeClass = (): void => {
        this.setState({ classStatus: ClassStatusType.started });
    };

    private stopClass = (): void => {
        this.setState({ classStatus: ClassStatusType.stopped });
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
                {this.renderAvatars()}
                <div className="realtime-content">
                    {this.props.whiteboard.whiteboardElement}
                    {this.renderRealtimePanel()}
                </div>
            </div>
        );
    }

    private renderAvatars(): React.ReactNode {
        return <div className="realtime-avatars"></div>;
    }

    private renderTopBarLeft(): React.ReactNode {
        const { identity } = this.props.match.params;
        const { classStatus } = this.state;
        return (
            <>
                <NetworkStatus />
                {identity === Identity.joiner && (
                    <ClassStatus isClassBegin={classStatus === ClassStatusType.started} />
                )}
            </>
        );
    }

    private renderClassMode(): React.ReactNode {
        return this.state.classMode === ClassModeType.lecture ? (
            <TopBarRoundBtn
                title="当前为讲课模式"
                dark
                icon="class-interaction"
                onClick={this.toggleClassMode}
            >
                切换至互动模式
            </TopBarRoundBtn>
        ) : (
            <TopBarRoundBtn
                title="当前为互动模式"
                dark
                icon="class-lecture"
                onClick={this.toggleClassMode}
            >
                切换至讲课模式
            </TopBarRoundBtn>
        );
    }

    private renderTopBarCenter(): React.ReactNode {
        const { identity } = this.props.match.params;
        const { classStatus } = this.state;

        if (identity !== Identity.creator) {
            return null;
        }

        switch (classStatus) {
            case ClassStatusType.started:
                return (
                    <>
                        {this.renderClassMode()}
                        <TopBarRoundBtn icon="class-pause" onClick={this.pauseClass}>
                            暂停上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn icon="class-stop" onClick={this.stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            case ClassStatusType.paused:
                return (
                    <>
                        {this.renderClassMode()}
                        <TopBarRoundBtn icon="class-pause" onClick={this.resumeClass}>
                            恢复上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn icon="class-stop" onClick={this.stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            default:
                return (
                    <TopBarRoundBtn icon="class-begin" onClick={this.startClass}>
                        开始上课
                    </TopBarRoundBtn>
                );
        }
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
                    onClick={toggleRecording}
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
                isVideoOn={false}
                videoSlot={
                    isCalling &&
                    creatorUid && (
                        <div className="whiteboard-rtc-box">
                            <div
                                className={classNames("whiteboard-rtc-avatar", {
                                    "is-small": mainSpeaker !== null && mainSpeaker !== creatorUid,
                                })}
                            >
                                <VideoAvatar
                                    uid={creatorUid}
                                    type={
                                        creatorUid === userId ? VideoType.local : VideoType.remote
                                    }
                                    rtcEngine={rtc.rtcEngine}
                                />
                            </div>
                            {speakingJoiner !== null && (
                                <div
                                    className={classNames("whiteboard-rtc-avatar", {
                                        "is-small": mainSpeaker !== speakingJoiner,
                                    })}
                                >
                                    <VideoAvatar
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

export default withWhiteboardRoute(withRtcRoute(withRtmRoute(SmallClassPage)));
