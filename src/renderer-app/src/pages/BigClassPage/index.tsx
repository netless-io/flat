import React, { useEffect, useRef, useState } from "react";
import { useUpdateEffect } from "react-use";
import { message } from "antd";
import classNames from "classnames";
import { ViewMode } from "white-web-sdk";

import InviteButton from "../../components/InviteButton";
import { TopBar, TopBarDivider } from "../../components/TopBar";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { BigClassAvatar } from "./BigClassAvatar";
import { NetworkStatus } from "../../components/NetworkStatus";
import { RecordButton } from "../../components/RecordButton";
import { RoomInfo } from "../../components/RoomInfo";
import { withRtcRoute, WithRtcRouteProps } from "../../components/Rtc";
import { withRtmRoute, WithRtmRouteProps } from "../../components/Rtm";
import { RTMUser } from "../../components/ChatPanel/ChatUser";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { ExitRoomConfirm, ExitRoomConfirmType } from "../../components/ExitRoomConfirm";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";

import { RtcChannelType } from "../../apiMiddleware/Rtc";
import { Identity } from "../../utils/localStorage/room";
import { ipcAsyncByMain } from "../../utils/ipc";

import "./BigClassPage.less";
import { useWhiteboardStore } from "../../stores/WhiteboardStore";
import { Whiteboard } from "../../components/Whiteboard";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router";

export interface RouterParams {
    identity: Identity;
    uuid: string;
    userId: string;
}

export type BigClassPageProps = WithRtcRouteProps & WithRtmRouteProps;

const BigClassPage = observer<BigClassPageProps>(props => {
    // @TODO remove ref
    const exitRoomConfirmRef = useRef((_confirmType: ExitRoomConfirmType) => {});

    const history = useHistory();
    const params = useParams<RouterParams>();

    const whiteboardStore = useWhiteboardStore(params.identity === Identity.creator);

    const [speakingJoiner, setSpeakingJoiner] = useState<RTMUser | undefined>(
        props.rtm.speakingJoiners[0],
    );
    const [mainSpeaker, setMainSpeaker] = useState<RTMUser | undefined>(speakingJoiner);
    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    useEffect(() => {
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 700,
        });
    }, []);

    useEffect(() => {
        if (props.rtm.roomStatus === RoomStatus.Stopped) {
            history.push("/user/");
        }
    }, [props.rtm.roomStatus, history]);

    useEffect(() => {
        if (props.rtm.currentUser && params.identity !== Identity.creator) {
            // join rtc room to listen to creator events
            const { currentUser } = props.rtm;
            if (currentUser) {
                const { isCalling, toggleCalling } = props.rtc;
                if (!isCalling) {
                    toggleCalling(currentUser.rtcUID);
                }

                if (whiteboardStore.room) {
                    whiteboardStore.room.disableDeviceInputs = !currentUser.isSpeak;
                }
            }
        }
        // only track when the currentUser is ready
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.rtm.currentUser]);

    useUpdateEffect(() => {
        const user = props.rtm.speakingJoiners[0];
        const speak = user && (user.camera || user.mic);
        setSpeakingJoiner(speak ? user : undefined);
        setMainSpeaker(speak ? user : undefined);
        if (params.userId === user?.uuid) {
            props.rtc.rtc.rtcEngine.setClientRole(speak ? 1 : 2);
        }
    }, [props.rtm.speakingJoiners[0]]);

    return (
        <div className="realtime-box">
            <TopBar
                left={renderTopBarLeft()}
                center={renderTopBarCenter()}
                right={renderTopBarRight()}
            />
            <div className="realtime-content">
                <Whiteboard whiteboardStore={whiteboardStore} />
                {renderRealtimePanel()}
            </div>
            <ExitRoomConfirm
                identity={params.identity}
                history={history}
                roomStatus={props.rtm.roomStatus}
                stopClass={props.rtm.stopClass}
                confirmRef={exitRoomConfirmRef}
            />
        </div>
    );

    function renderTopBarLeft(): React.ReactNode {
        const { identity } = params;
        const { roomStatus } = props.rtm;

        return (
            <>
                <NetworkStatus />
                {identity === Identity.joiner && (
                    <RoomInfo roomStatus={roomStatus} roomType={props.rtm.roomInfo?.roomType} />
                )}
            </>
        );
    }

    function renderTopBarCenter(): React.ReactNode {
        const { identity } = params;
        const { roomStatus, pauseClass, resumeClass, startClass } = props.rtm;

        if (identity !== Identity.creator) {
            return null;
        }

        switch (roomStatus) {
            case RoomStatus.Started:
                return (
                    <>
                        <TopBarRoundBtn iconName="class-pause" onClick={pauseClass}>
                            暂停上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            case RoomStatus.Paused:
                return (
                    <>
                        <TopBarRoundBtn iconName="class-pause" onClick={resumeClass}>
                            恢复上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            default:
                return (
                    <TopBarRoundBtn iconName="class-begin" onClick={startClass}>
                        开始上课
                    </TopBarRoundBtn>
                );
        }
    }

    function renderTopBarRight(): React.ReactNode {
        const { viewMode } = whiteboardStore;
        const { isCalling, isRecording, toggleRecording } = props.rtc;
        const { roomStatus } = props.rtm;
        const { uuid, identity } = params;
        const isCreator = identity === Identity.creator;

        return (
            <>
                {isCreator &&
                    (roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused) && (
                        <RecordButton
                            disabled={false}
                            isRecording={isRecording}
                            onClick={() =>
                                toggleRecording(() => {
                                    // alert result
                                })
                            }
                        />
                    )}
                {isCreator && (
                    <TopBarRightBtn
                        title="Call"
                        icon="phone"
                        active={isCalling}
                        onClick={toggleCalling}
                    />
                )}
                <TopBarRightBtn
                    title="Vision control"
                    icon="follow"
                    active={viewMode === ViewMode.Broadcaster}
                    onClick={handleRoomController}
                />
                <TopBarRightBtn
                    title="Docs center"
                    icon="folder"
                    onClick={() => whiteboardStore.toggleFileOpen()}
                />
                <InviteButton uuid={uuid} />
                {/* @TODO implement Options menu */}
                <TopBarRightBtn title="Options" icon="options" onClick={() => {}} />
                <TopBarRightBtn
                    title="Exit"
                    icon="exit"
                    onClick={() => {
                        // @TODO remove ref
                        exitRoomConfirmRef.current(ExitRoomConfirmType.ExitButton);
                    }}
                />
                <TopBarDivider />
                <TopBarRightBtn
                    title="Open side panel"
                    icon="hide-side"
                    active={isRealtimeSideOpen}
                    onClick={handleSideOpenerSwitch}
                />
            </>
        );
    }

    function renderRealtimePanel(): React.ReactNode {
        const { uuid, userId, identity } = params;
        const { isCalling, rtc } = props.rtc;
        const { creator, updateDeviceState } = props.rtm;
        const isVideoOn = identity === Identity.creator ? isCalling : !!creator?.isSpeak;

        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={isVideoOn}
                videoSlot={
                    creator &&
                    isVideoOn && (
                        <div
                            className={classNames("whiteboard-rtc-box", {
                                "with-small": speakingJoiner,
                            })}
                        >
                            <div
                                className={classNames("whiteboard-rtc-avatar", {
                                    "is-small": mainSpeaker && mainSpeaker.uuid !== creator.uuid,
                                })}
                            >
                                <BigClassAvatar
                                    identity={identity}
                                    userId={userId}
                                    avatarUser={creator}
                                    rtcEngine={rtc.rtcEngine}
                                    updateDeviceState={updateDeviceState}
                                    small={mainSpeaker && mainSpeaker.uuid !== creator.uuid}
                                    onExpand={onVideoAvatarExpand}
                                />
                            </div>
                            {speakingJoiner && (
                                <div
                                    className={classNames("whiteboard-rtc-avatar", {
                                        "is-small": mainSpeaker !== speakingJoiner,
                                    })}
                                >
                                    <BigClassAvatar
                                        avatarUser={speakingJoiner}
                                        identity={identity}
                                        userId={userId}
                                        rtcEngine={rtc.rtcEngine}
                                        updateDeviceState={updateDeviceState}
                                        small={mainSpeaker !== speakingJoiner}
                                        onExpand={onVideoAvatarExpand}
                                    />
                                </div>
                            )}
                        </div>
                    )
                }
                chatSlot={
                    <ChatPanel
                        userId={userId}
                        channelID={uuid}
                        identity={identity}
                        rtm={props.rtm}
                        allowMultipleSpeakers={false}
                    ></ChatPanel>
                }
            />
        );
    }

    function handleRoomController(): void {
        const { room } = whiteboardStore;
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
    }

    function handleSideOpenerSwitch(): void {
        openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
    }

    function onVideoAvatarExpand(): void {
        setMainSpeaker(mainSpeaker =>
            mainSpeaker?.uuid === props.rtm.creator?.uuid ? speakingJoiner : props.rtm.creator,
        );
    }

    function toggleCalling(): void {
        const { currentUser } = props.rtm;
        if (!currentUser) {
            return;
        }

        props.rtc.toggleCalling(currentUser.rtcUID, () => {
            const { userId } = params;
            const { isCalling } = props.rtc;
            const { speakingJoiners, onSpeak } = props.rtm;
            const speakConfigs: Array<{ userUUID: string; speak: boolean }> = [
                { userUUID: userId, speak: isCalling },
            ];
            if (isCalling) {
                openRealtimeSide(true);
            } else {
                speakConfigs.push(
                    ...speakingJoiners.map(user => ({ userUUID: user.uuid, speak: false })),
                );
            }
            onSpeak(speakConfigs);
        });
    }

    function stopClass(): void {
        // @TODO remove ref
        exitRoomConfirmRef.current(ExitRoomConfirmType.StopClassButton);
    }
});

export default withRtcRoute({
    recordingConfig: {
        channelType: RtcChannelType.Broadcast,
        transcodingConfig: {
            width: 288,
            height: 216,
            // https://docs.agora.io/cn/cloud-recording/recording_video_profile
            fps: 15,
            bitrate: 280,
            mixedVideoLayout: 3,
            backgroundColor: "#000000",
            layoutConfig: [
                {
                    x_axis: 0,
                    y_axis: 0,
                    width: 1,
                    height: 1,
                    alpha: 1.0,
                    render_mode: 1,
                },
                {
                    x_axis: 0.0,
                    y_axis: 0.67,
                    width: 0.33,
                    height: 0.33,
                    alpha: 1.0,
                    render_mode: 1,
                },
            ],
        },
        maxIdleTime: 60,
        subscribeUidGroup: 0,
    },
})(withRtmRoute(BigClassPage));
