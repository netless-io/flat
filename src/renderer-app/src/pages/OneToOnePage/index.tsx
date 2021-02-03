import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { RoomPhase, ViewMode } from "white-web-sdk";

import InviteButton from "../../components/InviteButton";
import { TopBar, TopBarDivider } from "../../components/TopBar";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { OneToOneAvatar } from "./OneToOneAvatar";
import { NetworkStatus } from "../../components/NetworkStatus";
import { RecordButton } from "../../components/RecordButton";
import { RoomInfo } from "../../components/RoomInfo";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { ExitRoomConfirm, ExitRoomConfirmType } from "../../components/ExitRoomConfirm";
import { Whiteboard } from "../../components/Whiteboard";
import LoadingPage from "../../LoadingPage";
import { RoomStatus, RoomType } from "../../apiMiddleware/flatServer/constants";
import { useWhiteboardStore } from "../../stores/WhiteboardStore";
import { RecordingConfig, useClassRoomStore } from "../../stores/ClassRoomStore";
import { RtcChannelType } from "../../apiMiddleware/Rtc";
import { ipcAsyncByMain } from "../../utils/ipc";
import { useAutoRun } from "../../utils/mobx";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";

import "./OneToOnePage.less";

const recordingConfig: RecordingConfig = Object.freeze({
    channelType: RtcChannelType.Communication,
    transcodingConfig: {
        width: 288,
        height: 216,
        // https://docs.agora.io/cn/cloud-recording/recording_video_profile
        fps: 15,
        bitrate: 140,
        mixedVideoLayout: 1,
        backgroundColor: "#000000",
    },
    maxIdleTime: 60,
    subscribeUidGroup: 0,
});

export type OneToOnePageProps = {};

export const OneToOnePage = observer<OneToOnePageProps>(function OneToOnePage() {
    // @TODO remove ref
    const exitRoomConfirmRef = useRef((_confirmType: ExitRoomConfirmType) => {});

    const params = useParams<RouteParams<RouteNameType.OneToOnePage>>();
    const pushHistory = usePushHistory();

    const classRoomStore = useClassRoomStore(params.roomUUID, params.ownerUUID, recordingConfig);
    const whiteboardStore = useWhiteboardStore(classRoomStore.isCreator);

    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    useAutoRun(reaction => {
        if (!classRoomStore.isCreator) {
            reaction.dispose();
            return;
        }

        // track all joiners
        const { speakingJoiners, handRaisingJoiners, otherJoiners } = classRoomStore;

        if (speakingJoiners.length > 0) {
            return;
        }

        let joiner =
            handRaisingJoiners.length > 0
                ? handRaisingJoiners[0]
                : otherJoiners.length > 0
                ? otherJoiners[0]
                : null;

        if (joiner) {
            classRoomStore.onSpeak([{ userUUID: joiner.userUUID, speak: true }]);
        }
    });

    useEffect(() => {
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 700,
        });
    }, []);

    useAutoRun(() => {
        if (classRoomStore.roomStatus === RoomStatus.Stopped) {
            ipcAsyncByMain("set-close-window", {
                close: true,
            });

            pushHistory(RouteNameType.HomePage, {});
        }
    });

    useAutoRun(reaction => {
        const { currentUser, creator } = classRoomStore;
        if (
            (currentUser && currentUser.isSpeak && (currentUser.camera || currentUser.mic)) ||
            (creator && (creator.camera || creator.mic))
        ) {
            // join rtc room to listen to creator events
            classRoomStore.startCalling();
            // run only once
            reaction.dispose();
        }
    });

    // control whiteboard writable
    useAutoRun(reaction => {
        // ignore creator
        if (classRoomStore.isCreator) {
            reaction.dispose();
            return;
        }
        if (whiteboardStore.room && classRoomStore.currentUser) {
            const isWritable = classRoomStore.currentUser.isSpeak;
            if (whiteboardStore.room.disableDeviceInputs === isWritable) {
                whiteboardStore.room.disableDeviceInputs = !isWritable;
                whiteboardStore.room.setWritable(isWritable);
            }
        }
    });

    if (
        !whiteboardStore.room ||
        whiteboardStore.phase === RoomPhase.Connecting ||
        whiteboardStore.phase === RoomPhase.Disconnecting ||
        whiteboardStore.phase === RoomPhase.Reconnecting
    ) {
        return <LoadingPage />;
    }

    return (
        <div className="one-to-one-realtime-box">
            <TopBar
                left={renderTopBarLeft()}
                center={renderTopBarCenter()}
                right={renderTopBarRight()}
            />
            <div className="one-to-one-realtime-content">
                <Whiteboard whiteboardStore={whiteboardStore} />
                {renderRealtimePanel()}
            </div>
            <ExitRoomConfirm
                isCreator={classRoomStore.isCreator}
                roomStatus={classRoomStore.roomStatus}
                stopClass={classRoomStore.stopClass}
                confirmRef={exitRoomConfirmRef}
            />
        </div>
    );

    function renderTopBarLeft(): React.ReactNode {
        return (
            <>
                <NetworkStatus />
                {!classRoomStore.isCreator && (
                    <RoomInfo roomStatus={classRoomStore.roomStatus} roomType={RoomType.OneToOne} />
                )}
            </>
        );
    }

    function renderTopBarCenter(): React.ReactNode {
        if (!classRoomStore.isCreator) {
            return null;
        }

        switch (classRoomStore.roomStatus) {
            case RoomStatus.Started:
                return (
                    <>
                        <TopBarRoundBtn iconName="class-pause" onClick={classRoomStore.pauseClass}>
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
                        <TopBarRoundBtn iconName="class-pause" onClick={classRoomStore.resumeClass}>
                            恢复上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            default:
                return (
                    <TopBarRoundBtn iconName="class-begin" onClick={classRoomStore.startClass}>
                        开始上课
                    </TopBarRoundBtn>
                );
        }
    }

    function renderTopBarRight(): React.ReactNode {
        return (
            <>
                {classRoomStore.isCreator &&
                    (classRoomStore.roomStatus === RoomStatus.Started ||
                        classRoomStore.roomStatus === RoomStatus.Paused) && (
                        <RecordButton
                            disabled={false}
                            isRecording={classRoomStore.isRecording}
                            onClick={classRoomStore.toggleRecording}
                        />
                    )}
                <TopBarRightBtn
                    title="Vision control"
                    icon="follow"
                    active={whiteboardStore.viewMode === ViewMode.Broadcaster}
                    onClick={handleRoomController}
                />
                <TopBarRightBtn
                    title="Docs center"
                    icon="folder"
                    onClick={whiteboardStore.toggleFileOpen}
                />
                <InviteButton uuid={classRoomStore.roomUUID} />
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
        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={true}
                videoSlot={
                    <div className="one-to-one-rtc-avatar-container">
                        {classRoomStore.creator && (
                            <OneToOneAvatar
                                isCreator={classRoomStore.isCreator}
                                userUUID={classRoomStore.userUUID}
                                avatarUser={classRoomStore.creator}
                                rtcEngine={classRoomStore.rtc.rtcEngine}
                                updateDeviceState={classRoomStore.updateDeviceState}
                            />
                        )}
                        {classRoomStore.speakingJoiners.length > 0 && (
                            <OneToOneAvatar
                                isCreator={classRoomStore.isCreator}
                                userUUID={classRoomStore.userUUID}
                                avatarUser={classRoomStore.speakingJoiners[0]}
                                rtcEngine={classRoomStore.rtc.rtcEngine}
                                updateDeviceState={classRoomStore.updateDeviceState}
                            />
                        )}
                    </div>
                }
                chatSlot={
                    <ChatPanel
                        classRoomStore={classRoomStore}
                        disableMultipleSpeakers={true}
                        disableHandRaising={true}
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

    function stopClass(): void {
        // @TODO remove ref
        exitRoomConfirmRef.current(ExitRoomConfirmType.StopClassButton);
    }
});

export default OneToOnePage;
