import "./OneToOnePage.less";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { RoomPhase } from "white-web-sdk";
import {
    NetworkStatus,
    RoomInfo,
    TopBar,
    TopBarRightBtn,
    TopBarDivider,
    LoadingPage,
    Timer,
    CloudRecordBtn,
    SVGScreenSharing,
    SVGExit,
    SVGMenuFold,
    SVGMenuUnfold,
} from "flat-components";

import InviteButton from "../../components/InviteButton";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { RTCAvatar } from "../../components/RTCAvatar";
import {
    ExitRoomConfirm,
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../../components/ExitRoomConfirm";
import { Whiteboard } from "../../components/Whiteboard";
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";
import { RoomStatus } from "../../api-middleware/flatServer/constants";
import { RecordingConfig, useClassRoomStore } from "../../stores/class-room-store";
import { RtcChannelType } from "../../api-middleware/rtc/room";
import { useComputed } from "../../utils/mobx";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import { AgoraCloudRecordBackgroundConfigItem } from "../../api-middleware/flatServer/agora";
import { runtime } from "../../utils/runtime";
import { ShareScreen } from "../../components/ShareScreen";
import { useLoginCheck } from "../utils/use-login-check";

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
    useLoginCheck();

    const { i18n, t } = useTranslation();
    const params = useParams<RouteParams<RouteNameType.OneToOnePage>>();

    const classRoomStore = useClassRoomStore({ ...params, recordingConfig, i18n });
    const whiteboardStore = classRoomStore.whiteboardStore;

    const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classRoomStore);

    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    const updateLayoutTimeoutRef = useRef(NaN);
    const loadingPageRef = useRef(false);

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
        whiteboardStore.phase === RoomPhase.Disconnecting
    ) {
        loadingPageRef.current = true;
    } else {
        if (classRoomStore.isCreator && classRoomStore.roomStatus === RoomStatus.Idle) {
            void classRoomStore.startClass();
        }
        loadingPageRef.current = false;
    }

    return (
        <div className="one-to-one-realtime-container">
            {loadingPageRef.current && <LoadingPage onTimeout="full-reload" />}
            <div className="one-to-one-realtime-box">
                <TopBar
                    isMac={runtime.isMac}
                    left={renderTopBarLeft()}
                    right={renderTopBarRight()}
                />
                <div className="one-to-one-realtime-content">
                    <div className="one-to-one-realtime-content-container">
                        <ShareScreen classRoomStore={classRoomStore} />
                        <Whiteboard
                            classRoomStore={classRoomStore}
                            disableHandRaising={true}
                            whiteboardStore={whiteboardStore}
                        />
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
                {classRoomStore.isCreator ? (
                    classRoomStore.roomInfo?.beginTime && (
                        <Timer
                            beginTime={classRoomStore.roomInfo.beginTime}
                            roomStatus={classRoomStore.roomStatus}
                        />
                    )
                ) : (
                    <RoomInfo
                        roomStatus={classRoomStore.roomStatus}
                        roomType={classRoomStore.roomInfo?.roomType}
                    />
                )}
            </>
        );
    }

    function renderTopBarRight(): React.ReactNode {
        return (
            <>
                {whiteboardStore.isWritable && !classRoomStore.isRemoteScreenSharing && (
                    <TopBarRightBtn
                        icon={<SVGScreenSharing active={classRoomStore.isScreenSharing} />}
                        title={t("share-screen.self")}
                        onClick={() => classRoomStore.toggleShareScreen()}
                    />
                )}

                {classRoomStore.isCreator && (
                    <CloudRecordBtn
                        isRecording={classRoomStore.isRecording}
                        onClick={() => {
                            void classRoomStore.toggleRecording({
                                onStop() {
                                    void message.success(t("recording-completed-tips"));
                                },
                            });
                        }}
                    />
                )}
                {/* TODO: open cloud-storage sub window */}
                <CloudStorageButton classroom={classRoomStore} />
                <InviteButton roomInfo={classRoomStore.roomInfo} />
                <TopBarRightBtn
                    icon={<SVGExit />}
                    title={t("exit")}
                    onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
                />
                <TopBarDivider />
                <TopBarRightBtn
                    icon={isRealtimeSideOpen ? <SVGMenuUnfold /> : <SVGMenuFold />}
                    title={isRealtimeSideOpen ? t("side-panel.hide") : t("side-panel.show")}
                    onClick={handleSideOpenerSwitch}
                />
            </>
        );
    }

    function renderRealtimePanel(): React.ReactNode {
        return (
            <RealtimePanel
                chatSlot={
                    <ChatPanel
                        classRoomStore={classRoomStore}
                        disableMultipleSpeakers={true}
                    ></ChatPanel>
                }
                isShow={isRealtimeSideOpen}
                isVideoOn={classRoomStore.isJoinedRTC}
                videoSlot={
                    <div className="one-to-one-rtc-avatar-container">
                        <RTCAvatar
                            avatarUser={classRoomStore.users.creator}
                            isAvatarUserCreator={true}
                            isCreator={classRoomStore.isCreator}
                            rtcAvatar={
                                classRoomStore.users.creator &&
                                classRoomStore.rtc.getAvatar(classRoomStore.users.creator.rtcUID)
                            }
                            updateDeviceState={classRoomStore.updateDeviceState}
                            userUUID={classRoomStore.userUUID}
                        />
                        <RTCAvatar
                            avatarUser={joiner}
                            isAvatarUserCreator={false}
                            isCreator={classRoomStore.isCreator}
                            rtcAvatar={joiner && classRoomStore.rtc.getAvatar(joiner.rtcUID)}
                            updateDeviceState={classRoomStore.updateDeviceState}
                            userUUID={classRoomStore.userUUID}
                        />
                    </div>
                }
            />
        );
    }

    function handleSideOpenerSwitch(): void {
        openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
        whiteboardStore.setRightSideClose(isRealtimeSideOpen);
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
