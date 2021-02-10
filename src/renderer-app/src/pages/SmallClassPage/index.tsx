import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { RoomPhase, ViewMode } from "white-web-sdk";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router";

import InviteButton from "../../components/InviteButton";
import { TopBar, TopBarDivider } from "../../components/TopBar";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { SmallClassAvatar } from "./SmallClassAvatar";
import { NetworkStatus } from "../../components/NetworkStatus";
import { RecordButton } from "../../components/RecordButton";
import { RoomInfo } from "../../components/RoomInfo";
import { Whiteboard } from "../../components/Whiteboard";
import ExitRoomConfirm, { ExitRoomConfirmType } from "../../components/ExitRoomConfirm";
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";
import LoadingPage from "../../LoadingPage";

import { ipcAsyncByMain } from "../../utils/ipc";
import { useAutoRun, useComputed } from "../../utils/mobx";
import { RtcChannelType } from "../../apiMiddleware/Rtc";
import { ClassModeType } from "../../apiMiddleware/Rtm";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { AgoraCloudRecordLayoutConfigItem } from "../../apiMiddleware/flatServer/agora";
import { useWhiteboardStore } from "../../stores/WhiteboardStore";
import { RecordingConfig, useClassRoomStore, User } from "../../stores/ClassRoomStore";
import { RouteNameType, RouteParams } from "../../utils/routes";

import "./SmallClassPage.less";

const AVATAR_WIDTH = 144;
const AVATAR_HEIGHT = 108;
const MAX_AVATAR_COUNT = 17;
const AVATAR_BAR_GAP = 4;
const AVATAR_BAR_WIDTH = (AVATAR_WIDTH + AVATAR_BAR_GAP) * MAX_AVATAR_COUNT - AVATAR_BAR_GAP;

const recordingConfig: RecordingConfig = Object.freeze({
    channelType: RtcChannelType.Communication,
    transcodingConfig: {
        width: AVATAR_BAR_WIDTH,
        height: AVATAR_HEIGHT,
        // https://docs.agora.io/cn/cloud-recording/recording_video_profile
        fps: 15,
        bitrate: 500,
        mixedVideoLayout: 3,
        backgroundColor: "#F3F6F9",
        layoutConfig: updateRecordLayout(1),
    },
    maxIdleTime: 60,
    subscribeUidGroup: 3,
});

export type SmallClassPageProps = {};

export const SmallClassPage = observer<SmallClassPageProps>(function SmallClassPage() {
    // @TODO remove ref
    const exitRoomConfirmRef = useRef((_confirmType: ExitRoomConfirmType) => {});

    const params = useParams<RouteParams<RouteNameType.SmallClassPage>>();

    const classRoomStore = useClassRoomStore(params.roomUUID, params.ownerUUID, recordingConfig);
    const whiteboardStore = useWhiteboardStore(classRoomStore.isCreator);

    const { room, phase } = whiteboardStore;

    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    /**
     * users with camera or mic on
     */
    const activeUserCount = useComputed(() => {
        let count =
            (classRoomStore.users.creator ? 1 : 0) + classRoomStore.users.speakingJoiners.length;
        if (classRoomStore.classMode === ClassModeType.Interaction) {
            // all users are on in interaction mode
            count +=
                classRoomStore.users.handRaisingJoiners.length +
                classRoomStore.users.otherJoiners.length;
        }
        return count;
    });

    useEffect(() => {
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 700,
        });
    }, []);

    // control whiteboard writable
    useEffect(() => {
        if (!classRoomStore.isCreator && classRoomStore.users.currentUser) {
            whiteboardStore.updateWritable(classRoomStore.users.currentUser.isSpeak);
        }
        // dumb exhaustive-deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classRoomStore.users.currentUser?.isSpeak]);

    // update cloud recording layout
    useAutoRun(() => {
        if (classRoomStore.isRecording) {
            classRoomStore.cloudRecording.updateLayout({
                mixedVideoLayout: 3,
                backgroundColor: "#F3F6F9",
                layoutConfig: updateRecordLayout(activeUserCount.get()),
            });
        }
    });

    if (
        !room ||
        phase === RoomPhase.Connecting ||
        phase === RoomPhase.Disconnecting ||
        phase === RoomPhase.Reconnecting
    ) {
        return <LoadingPage />;
    }

    return (
        <div className="realtime-box">
            <TopBar
                left={renderTopBarLeft()}
                center={renderTopBarCenter()}
                right={renderTopBarRight()}
            />
            {renderAvatars()}
            <div className="realtime-content">
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

    function renderAvatars(): React.ReactNode {
        if (!classRoomStore.users.creator) {
            return null;
        }

        return (
            <div className="realtime-avatars-wrap">
                <div className="realtime-avatars">
                    {renderAvatar(classRoomStore.users.creator)}
                    {classRoomStore.users.speakingJoiners.map(renderAvatar)}
                    {classRoomStore.classMode === ClassModeType.Interaction && (
                        <>
                            {classRoomStore.users.handRaisingJoiners.map(renderAvatar)}
                            {classRoomStore.users.otherJoiners.map(renderAvatar)}
                        </>
                    )}
                </div>
            </div>
        );
    }

    function renderTopBarLeft(): React.ReactNode {
        return (
            <>
                <NetworkStatus />
                {!classRoomStore.isCreator && (
                    <RoomInfo
                        roomStatus={classRoomStore.roomStatus}
                        roomType={classRoomStore.roomInfo?.roomType}
                    />
                )}
            </>
        );
    }

    function renderClassMode(): React.ReactNode {
        return classRoomStore.classMode === ClassModeType.Lecture ? (
            <TopBarRoundBtn
                title="当前为讲课模式"
                dark
                iconName="class-interaction"
                onClick={classRoomStore.toggleClassMode}
            >
                切换至互动模式
            </TopBarRoundBtn>
        ) : (
            <TopBarRoundBtn
                title="当前为互动模式"
                dark
                iconName="class-lecture"
                onClick={classRoomStore.toggleClassMode}
            >
                切换至讲课模式
            </TopBarRoundBtn>
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
                        {renderClassMode()}
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
                        {renderClassMode()}
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
                {(classRoomStore.isCreator || classRoomStore.users.currentUser?.isSpeak) && (
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
                    onClick={() => openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen)}
                />
            </>
        );
    }

    function renderRealtimePanel(): React.ReactNode {
        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={false}
                videoSlot={null}
                chatSlot={<ChatPanel classRoomStore={classRoomStore}></ChatPanel>}
            />
        );
    }

    function renderAvatar(user: User): React.ReactNode {
        return (
            <SmallClassAvatar
                isCreator={classRoomStore.isCreator}
                key={user.userUUID}
                userUUID={classRoomStore.userUUID}
                avatarUser={user}
                rtcEngine={classRoomStore.rtc.rtcEngine}
                updateDeviceState={classRoomStore.updateDeviceState}
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

    function stopClass(): void {
        // @TODO remove ref
        exitRoomConfirmRef.current(ExitRoomConfirmType.StopClassButton);
    }
});

export default SmallClassPage;

function updateRecordLayout(userCount: number): AgoraCloudRecordLayoutConfigItem[] {
    const layoutConfig: AgoraCloudRecordLayoutConfigItem[] = [];
    // the left most x position to start rendering the avatars
    let startX = 0;

    if (userCount < 7) {
        // center the avatars
        const avatarsWidth = userCount * (AVATAR_WIDTH + AVATAR_BAR_GAP) - AVATAR_BAR_GAP;
        // 1168 is the default visible avatar bar width
        startX = (1168 - avatarsWidth) / 2;
    }

    // calculate the max rendered config count
    // because x_axis cannot overflow
    const layoutConfigCount = Math.floor(
        (AVATAR_BAR_WIDTH - startX + AVATAR_BAR_GAP) / (AVATAR_WIDTH + AVATAR_BAR_GAP),
    );

    for (let i = 0; i < layoutConfigCount; i++) {
        layoutConfig.push({
            x_axis: (startX + i * (AVATAR_WIDTH + AVATAR_BAR_GAP)) / AVATAR_BAR_WIDTH,
            y_axis: 0,
            width: AVATAR_WIDTH / AVATAR_BAR_WIDTH,
            height: 1,
        });
    }

    return layoutConfig;
}
