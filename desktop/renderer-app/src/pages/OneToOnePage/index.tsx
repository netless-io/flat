import "./OneToOnePage.less";

import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { RoomPhase } from "white-web-sdk";
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
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { OneToOneAvatar } from "./OneToOneAvatar";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import {
    ExitRoomConfirm,
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../../components/ExitRoomConfirm";
import { Whiteboard } from "../../components/Whiteboard";
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";
import { RoomStatus, RoomType } from "../../api-middleware/flatServer/constants";
import {
    RecordingConfig,
    RoomStatusLoadingType,
    useClassRoomStore,
} from "../../stores/class-room-store";
import { RtcChannelType } from "../../api-middleware/rtc";
import { useComputed } from "../../utils/mobx";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { usePowerSaveBlocker } from "../../utils/hooks/use-power-save-blocker";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import { AgoraCloudRecordBackgroundConfigItem } from "../../api-middleware/flatServer/agora";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { runtime } from "../../utils/runtime";
import { useTranslation } from "react-i18next";
import { ShareScreen, ShareScreenPicker } from "../../components/ShareScreen";
import { generateAvatar } from "../../utils/generate-avatar";
import { AppStoreButton } from "../../components/AppStoreButton";

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
        defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
    },
    maxIdleTime: 60,
    subscribeUidGroup: 0,
});

export type OneToOnePageProps = {};

export const OneToOnePage = observer<OneToOnePageProps>(function OneToOnePage() {
    usePowerSaveBlocker();
    useWindowSize("Class");

    const params = useParams<RouteParams<RouteNameType.OneToOnePage>>();

    const classRoomStore = useClassRoomStore(params.roomUUID, params.ownerUUID, recordingConfig);
    const whiteboardStore = classRoomStore.whiteboardStore;
    const shareScreenStore = classRoomStore.shareScreenStore;

    const globalStore = useContext(GlobalStoreContext);
    const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classRoomStore);

    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    const updateLayoutTimeoutRef = useRef(NaN);
    const loadingPageRef = useRef(false);

    const { t } = useTranslation();

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

    useEffect(() => {
        void whiteboardStore.updateWritable(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    }, [classRoomStore.users.creator, joiner, classRoomStore.isRecording]);

    if (
        !whiteboardStore.room ||
        whiteboardStore.phase === RoomPhase.Connecting ||
        whiteboardStore.phase === RoomPhase.Disconnecting ||
        whiteboardStore.phase === RoomPhase.Reconnecting
    ) {
        loadingPageRef.current = true;
    } else {
        loadingPageRef.current = false;
    }

    function handleShareScreen(): void {
        if (shareScreenStore.enableShareScreenStatus) {
            shareScreenStore.close().catch(console.error);
        } else {
            shareScreenStore.updateShowShareScreenPicker(true);
        }
    }

    return (
        <div className="one-to-one-realtime-container">
            {loadingPageRef.current && <LoadingPage />}
            <div className="one-to-one-realtime-box">
                <TopBar
                    isMac={runtime.isMac}
                    left={renderTopBarLeft()}
                    center={renderTopBarCenter()}
                    right={renderTopBarRight()}
                />
                <div className="one-to-one-realtime-content">
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
                        visible={Boolean(whiteboardStore.room) && globalStore.isShowRecordHintTips}
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

                {whiteboardStore.isWritable && <AppStoreButton addApp={whiteboardStore.addApp} />}

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
                    title={isRealtimeSideOpen ? "hide side panel" : "show side panel"}
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
                isVideoOn={classRoomStore.isRTCJoined}
                videoSlot={
                    classRoomStore.isRTCJoined && (
                        <div className="one-to-one-rtc-avatar-container">
                            <OneToOneAvatar
                                isCreator={classRoomStore.isCreator}
                                userUUID={classRoomStore.userUUID}
                                avatarUser={classRoomStore.users.creator}
                                isAvatarUserCreator={true}
                                rtcEngine={classRoomStore.rtc.rtcEngine}
                                updateDeviceState={classRoomStore.updateDeviceState}
                                generateAvatar={generateAvatar}
                            />
                            <OneToOneAvatar
                                isCreator={classRoomStore.isCreator}
                                userUUID={classRoomStore.userUUID}
                                avatarUser={joiner}
                                rtcEngine={classRoomStore.rtc.rtcEngine}
                                updateDeviceState={classRoomStore.updateDeviceState}
                                generateAvatar={generateAvatar}
                            />
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

    function handleSideOpenerSwitch(): void {
        openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
    }

    function stopClass(): void {
        confirm(ExitRoomConfirmType.StopClassButton);
    }

    function updateCloudRecordLayout(): void {
        const { creator } = classRoomStore.users;
        const backgroundConfig: AgoraCloudRecordBackgroundConfigItem[] = [];

        if (creator) {
            backgroundConfig.push({
                uid: String(creator.rtcUID),
                image_url: creator.avatar,
            });
        }

        if (joiner) {
            backgroundConfig.push({
                uid: String(joiner.rtcUID),
                image_url: joiner.avatar,
            });
        }

        classRoomStore.updateRecordingLayout({
            mixedVideoLayout: 1,
            backgroundColor: "#000000",
            defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
            backgroundConfig,
        });
    }
});

export default OneToOnePage;
