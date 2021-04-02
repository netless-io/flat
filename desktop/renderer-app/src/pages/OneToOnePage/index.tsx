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
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";
import { RecordHintTips } from "../../components/RecordHintTips";
import LoadingPage from "../../LoadingPage";
import { RoomStatus, RoomType } from "../../apiMiddleware/flatServer/constants";
import {
    RecordingConfig,
    RoomStatusLoadingType,
    useClassRoomStore,
} from "../../stores/ClassRoomStore";
import { RtcChannelType } from "../../apiMiddleware/Rtc";
import { ipcAsyncByMainWindow } from "../../utils/ipc";
import { useComputed } from "../../utils/mobx";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { usePowerSaveBlocker } from "../../utils/hooks/usePowerSaveBlocker";

import "./OneToOnePage.less";
import { constants } from "flat-types";
import { useWindowSize } from "../../utils/hooks/useWindowSize";
import { CloudStorageButton } from "../../components/CloudStorageButton";

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
    usePowerSaveBlocker();
    useWindowSize("Class");
    // @TODO remove ref
    const exitRoomConfirmRef = useRef((_confirmType: ExitRoomConfirmType) => {});

    const params = useParams<RouteParams<RouteNameType.OneToOnePage>>();

    const classRoomStore = useClassRoomStore(params.roomUUID, params.ownerUUID, recordingConfig);
    const whiteboardStore = classRoomStore.whiteboardStore;

    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    const joiner = useComputed(() => {
        if (classRoomStore.isCreator) {
            return classRoomStore.users.speakingJoiners.length > 0
                ? classRoomStore.users.speakingJoiners[0]
                : classRoomStore.users.handRaisingJoiners.length > 0
                ? classRoomStore.users.handRaisingJoiners[0]
                : classRoomStore.users.otherJoiners.length > 0
                ? classRoomStore.users.otherJoiners[0]
                : null;
        }

        return classRoomStore.users.currentUser;
    }).get();

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
                hangClass={classRoomStore.hangClass}
                stopClass={classRoomStore.stopClass}
                confirmRef={exitRoomConfirmRef}
            />
            <RoomStatusStoppedModal
                isCreator={classRoomStore.isCreator}
                roomStatus={classRoomStore.roomStatus}
            />
        </div>
    );

    function renderTopBarLeft(): React.ReactNode {
        return (
            <>
                <NetworkStatus networkQuality={classRoomStore.networkQuality} />
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
            case RoomStatus.Started: {
                return (
                    <>
                        <TopBarRoundBtn iconName="class-pause" onClick={classRoomStore.pauseClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Pausing
                                ? "暂停中..."
                                : "暂停上课"}
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Stopping
                                ? "结束中..."
                                : "结束上课"}
                        </TopBarRoundBtn>
                    </>
                );
            }
            case RoomStatus.Paused: {
                return (
                    <>
                        <TopBarRoundBtn iconName="class-pause" onClick={classRoomStore.resumeClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Starting
                                ? "开始中..."
                                : "恢复上课"}
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Stopping
                                ? "结束中..."
                                : "结束上课"}
                        </TopBarRoundBtn>
                    </>
                );
            }
            default: {
                return (
                    <RecordHintTips>
                        <TopBarRoundBtn iconName="class-begin" onClick={classRoomStore.startClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Starting
                                ? "开始中..."
                                : "开始上课"}
                        </TopBarRoundBtn>
                    </RecordHintTips>
                );
            }
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
                {whiteboardStore.isWritable && (
                    <TopBarRightBtn
                        title="Vision control"
                        icon="follow"
                        active={whiteboardStore.viewMode === ViewMode.Broadcaster}
                        onClick={handleRoomController}
                    />
                )}
                {/* <TopBarRightBtn
                    title="Docs center"
                    icon="folder"
                    onClick={whiteboardStore.toggleFileOpen}
                /> */}
                {/* TODO: open cloud-storage sub window */}
                <CloudStorageButton whiteboard={whiteboardStore} />
                <InviteButton roomInfo={classRoomStore.roomInfo} />
                {/* @TODO implement Options menu */}
                {/* <TopBarRightBtn title="Options" icon="options" onClick={() => {}} /> */}
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
                isVideoOn={classRoomStore.isCalling}
                videoSlot={
                    classRoomStore.isCalling && (
                        <div className="one-to-one-rtc-avatar-container">
                            {classRoomStore.users.creator && (
                                <OneToOneAvatar
                                    isCreator={classRoomStore.isCreator}
                                    userUUID={classRoomStore.userUUID}
                                    avatarUser={classRoomStore.users.creator}
                                    rtcEngine={classRoomStore.rtc.rtcEngine}
                                    updateDeviceState={classRoomStore.updateDeviceState}
                                />
                            )}
                            {joiner && (
                                <OneToOneAvatar
                                    isCreator={classRoomStore.isCreator}
                                    userUUID={classRoomStore.userUUID}
                                    avatarUser={joiner}
                                    rtcEngine={classRoomStore.rtc.rtcEngine}
                                    updateDeviceState={classRoomStore.updateDeviceState}
                                />
                            )}
                        </div>
                    )
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
