import React, { useContext, useEffect, useRef, useState } from "react";
import { message } from "antd";
import { RoomPhase } from "white-web-sdk";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    NetworkStatus,
    RoomInfo,
    RecordHintTips,
    RecordButton,
    TopBar,
    TopBarDivider,
    LoadingPage,
} from "flat-components";

import InviteButton from "../../components/InviteButton";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { SmallClassAvatar } from "./SmallClassAvatar";
import { Whiteboard } from "../../components/Whiteboard";
import ExitRoomConfirm, {
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../../components/ExitRoomConfirm";
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";

import { RtcChannelType } from "../../apiMiddleware/Rtc";
import { ClassModeType } from "../../apiMiddleware/Rtm";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import {
    AgoraCloudRecordBackgroundConfigItem,
    AgoraCloudRecordLayoutConfigItem,
} from "../../apiMiddleware/flatServer/agora";
import {
    RecordingConfig,
    RoomStatusLoadingType,
    useClassRoomStore,
    User,
} from "../../stores/ClassRoomStore";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { usePowerSaveBlocker } from "../../utils/hooks/usePowerSaveBlocker";

import "./SmallClassPage.less";
import { useWindowSize } from "../../utils/hooks/useWindowSize";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { runtime } from "../../utils/runtime";
import { ShareScreen, ShareScreenPicker } from "../../components/ShareScreen";

const CLASSROOM_WIDTH = 1200;
const AVATAR_AREA_WIDTH = CLASSROOM_WIDTH - 16 * 2;
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
        defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
        layoutConfig: [
            {
                x_axis: (AVATAR_AREA_WIDTH - AVATAR_WIDTH) / 2 / AVATAR_BAR_WIDTH,
                y_axis: 0,
                width: AVATAR_WIDTH / AVATAR_BAR_WIDTH,
                height: 1,
            },
        ],
    },
    maxIdleTime: 60,
    subscribeUidGroup: 3,
});

export type SmallClassPageProps = {};

export const SmallClassPage = observer<SmallClassPageProps>(function SmallClassPage() {
    usePowerSaveBlocker();
    useWindowSize("Class");

    const params = useParams<RouteParams<RouteNameType.SmallClassPage>>();

    const classRoomStore = useClassRoomStore(
        params.roomUUID,
        params.ownerUUID,
        recordingConfig,
        ClassModeType.Interaction,
    );
    const whiteboardStore = classRoomStore.whiteboardStore;
    const shareScreenStore = classRoomStore.shareScreenStore;

    const globalStore = useContext(GlobalStoreContext);
    const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classRoomStore);

    const { room, phase } = whiteboardStore;

    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    const updateLayoutTimeoutRef = useRef(NaN);

    const { t } = useTranslation();

    // control whiteboard writable
    useEffect(() => {
        if (!classRoomStore.isCreator && whiteboardStore.room) {
            if (classRoomStore.classMode === ClassModeType.Interaction) {
                void whiteboardStore.updateWritable(true);
            } else if (classRoomStore.users.currentUser) {
                void whiteboardStore.updateWritable(classRoomStore.users.currentUser.isSpeak);
            }
        }
        // dumb exhaustive-deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classRoomStore.classMode, whiteboardStore.room, classRoomStore.users.currentUser?.isSpeak]);

    useEffect(() => {
        if (classRoomStore.isRecording) {
            window.clearTimeout(updateLayoutTimeoutRef.current);
            updateLayoutTimeoutRef.current = window.setTimeout(() => {
                if (classRoomStore.isRecording) {
                    updateCloudRecordLayout();
                }
            }, 1000);

            return () => {
                window.clearTimeout(updateLayoutTimeoutRef.current);
                updateLayoutTimeoutRef.current = NaN;
            };
        }
        return;
        // ignore updateCloudRecordLayout
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classRoomStore.users.totalUserCount, classRoomStore.isRecording]);

    if (
        !room ||
        phase === RoomPhase.Connecting ||
        phase === RoomPhase.Disconnecting ||
        phase === RoomPhase.Reconnecting
    ) {
        return <LoadingPage />;
    }

    function handleShareScreen(): void {
        if (shareScreenStore.enableShareScreenStatus) {
            shareScreenStore.close().catch(console.error);
        } else {
            shareScreenStore.updateShowShareScreenPicker(true);
        }
    }

    return (
        <div className="realtime-box">
            <TopBar
                isMac={runtime.isMac}
                left={renderTopBarLeft()}
                center={renderTopBarCenter()}
                right={renderTopBarRight()}
            />
            {renderAvatars()}
            <div className="realtime-content">
                <div className="container">
                    <ShareScreen shareScreenStore={shareScreenStore} />
                    <ShareScreenPicker
                        shareScreenStore={shareScreenStore}
                        handleOk={() => {
                            shareScreenStore.enable();
                        }}
                    />
                    <Whiteboard whiteboardStore={whiteboardStore} />
                </div>
                {renderRealtimePanel()}
            </div>
            <ExitRoomConfirm isCreator={classRoomStore.isCreator} {...exitConfirmModalProps} />
            <RoomStatusStoppedModal
                isCreator={classRoomStore.isCreator}
                isRemoteLogin={classRoomStore.isRemoteLogin}
                roomStatus={classRoomStore.roomStatus}
            />
        </div>
    );

    function renderAvatars(): React.ReactNode {
        return (
            <div className="realtime-avatars-wrap">
                <div className="realtime-avatars">
                    <SmallClassAvatar
                        isCreator={true}
                        userUUID={classRoomStore.userUUID}
                        avatarUser={classRoomStore.users.creator}
                        isAvatarUserCreator={true}
                        rtcEngine={classRoomStore.rtc.rtcEngine}
                        updateDeviceState={classRoomStore.updateDeviceState}
                    />
                    {classRoomStore.users.joiners.map(renderAvatar)}
                </div>
            </div>
        );
    }

    function renderTopBarLeft(): React.ReactNode {
        return (
            <>
                <NetworkStatus networkQuality={classRoomStore.networkQuality} />
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
                title={t("lecture-mode")}
                dark
                iconName="class-interaction"
                onClick={classRoomStore.toggleClassMode}
            >
                {t("switch-to-interactive-mode")}
            </TopBarRoundBtn>
        ) : (
            <TopBarRoundBtn
                title={t("interactive-mode")}
                dark
                iconName="class-lecture"
                onClick={classRoomStore.toggleClassMode}
            >
                {t("switch-to-lecture-mode")}
            </TopBarRoundBtn>
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
                        {renderClassMode()}
                        <TopBarRoundBtn iconName="class-pause" onClick={classRoomStore.pauseClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Pausing
                                ? t("pausing")
                                : t("pause")}
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Stopping
                                ? t("ending")
                                : t("end-the-class")}
                        </TopBarRoundBtn>
                    </>
                );
            }
            case RoomStatus.Paused: {
                return (
                    <>
                        {renderClassMode()}
                        <TopBarRoundBtn iconName="class-pause" onClick={classRoomStore.resumeClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Starting
                                ? t("starting")
                                : t("resume")}
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Stopping
                                ? t("ending")
                                : t("end-the-class")}
                        </TopBarRoundBtn>
                    </>
                );
            }
            default: {
                return (
                    <RecordHintTips
                        visible={globalStore.isShowRecordHintTips}
                        onClose={globalStore.hideRecordHintTips}
                    >
                        <TopBarRoundBtn iconName="class-begin" onClick={classRoomStore.startClass}>
                            {classRoomStore.roomStatusLoading === RoomStatusLoadingType.Starting
                                ? t("starting")
                                : t("start")}
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
                            onClick={() =>
                                classRoomStore.toggleRecording({
                                    onStop() {
                                        void message.success(t("recording-completed-tips"));
                                    },
                                })
                            }
                        />
                    )}

                {whiteboardStore.isWritable && !shareScreenStore.existOtherShareScreen && (
                    <TopBarRightBtn
                        title="Share Screen"
                        icon={
                            shareScreenStore.enableShareScreenStatus
                                ? "share-screen-active"
                                : "share-screen"
                        }
                        onClick={handleShareScreen}
                    />
                )}

                {/* {whiteboardStore.isWritable && (
                    <TopBarRightBtn
                        title="Vision control"
                        icon="follow"
                        active={whiteboardStore.viewMode === ViewMode.Broadcaster}
                        onClick={handleRoomController}
                    />
                )} */}

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
                    onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
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
                chatSlot={
                    <ChatPanel
                        classRoomStore={classRoomStore}
                        disableHandRaising={classRoomStore.classMode === ClassModeType.Interaction}
                    ></ChatPanel>
                }
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

    // function handleRoomController(): void {
    //     const { room } = whiteboardStore;
    //     if (!room) {
    //         return;
    //     }
    //     if (room.state.broadcastState.mode !== ViewMode.Broadcaster) {
    //         room.setViewMode(ViewMode.Broadcaster);
    //         void message.success(t("follow-your-perspective-tips"));
    //     } else {
    //         room.setViewMode(ViewMode.Freedom);
    //         void message.success(t("Stop-following-your-perspective-tips"));
    //     }
    // }

    function stopClass(): void {
        confirm(ExitRoomConfirmType.StopClassButton);
    }

    function updateCloudRecordLayout(): void {
        const { allUsers } = classRoomStore.users;
        const layoutConfig: AgoraCloudRecordLayoutConfigItem[] = [];
        const backgroundConfig: AgoraCloudRecordBackgroundConfigItem[] = [];

        let startX = 0;

        if (allUsers.length < 7) {
            // center the avatars
            const avatarsWidth = allUsers.length * (AVATAR_WIDTH + AVATAR_BAR_GAP) - AVATAR_BAR_GAP;
            startX = (AVATAR_AREA_WIDTH - avatarsWidth) / 2;
        }

        // calculate the max rendered config count
        // because x_axis cannot overflow
        const layoutConfigCount = Math.min(
            allUsers.length,
            Math.floor(
                (AVATAR_BAR_WIDTH - startX + AVATAR_BAR_GAP) / (AVATAR_WIDTH + AVATAR_BAR_GAP),
            ),
        );

        for (let i = 0; i < layoutConfigCount; i++) {
            layoutConfig.push({
                x_axis: (startX + i * (AVATAR_WIDTH + AVATAR_BAR_GAP)) / AVATAR_BAR_WIDTH,
                y_axis: 0,
                width: AVATAR_WIDTH / AVATAR_BAR_WIDTH,
                height: 1,
            });

            backgroundConfig.push({
                uid: String(allUsers[i].rtcUID),
                image_url: allUsers[i].avatar,
            });
        }

        classRoomStore.updateRecordingLayout({
            mixedVideoLayout: 3,
            backgroundColor: "#F3F6F9",
            defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
            layoutConfig,
            backgroundConfig,
        });
    }
});

export default SmallClassPage;
