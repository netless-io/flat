import "./SmallClassPage.less";

import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { RoomPhase } from "white-web-sdk";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    NetworkStatus,
    RoomInfo,
    RecordButton,
    TopBar,
    TopBarDivider,
    LoadingPage,
    Countdown,
} from "flat-components";

import InviteButton from "../../components/InviteButton";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { TopBarRightBtn } from "flat-components";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { SmallClassAvatar } from "./SmallClassAvatar";
import { Whiteboard } from "../../components/Whiteboard";
import ExitRoomConfirm, {
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../../components/ExitRoomConfirm";
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";

import { RtcChannelType } from "../../api-middleware/rtc";
import { ClassModeType } from "../../api-middleware/rtm";
import { RoomStatus } from "../../api-middleware/flatServer/constants";
import {
    AgoraCloudRecordBackgroundConfigItem,
    AgoraCloudRecordLayoutConfigItem,
} from "../../api-middleware/flatServer/agora";
import { RecordingConfig, useClassRoomStore, User } from "../../stores/class-room-store";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { usePowerSaveBlocker } from "../../utils/hooks/use-power-save-blocker";

import { useWindowSize } from "../../utils/hooks/use-window-size";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import { runtime } from "../../utils/runtime";
import { ShareScreen, ShareScreenPicker } from "../../components/ShareScreen";
import { generateAvatar } from "../../utils/generate-avatar";
import { AppStoreButton } from "../../components/AppStoreButton";

import shareScreenActiveSVG from "../../assets/image/share-screen-active.svg";
import shareScreenSVG from "../../assets/image/share-screen.svg";
import exitSVG from "../../assets/image/exit.svg";
import hideSideSVG from "../../assets/image/hide-side.svg";
import hideSideActiveSVG from "../../assets/image/hide-side-active.svg";

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

    const { i18n, t } = useTranslation();
    const classRoomStore = useClassRoomStore({
        ...params,
        recordingConfig,
        classMode: ClassModeType.Interaction,
        i18n,
    });
    const whiteboardStore = classRoomStore.whiteboardStore;
    const shareScreenStore = classRoomStore.shareScreenStore;

    const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classRoomStore);

    const { room, phase } = whiteboardStore;

    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    const updateLayoutTimeoutRef = useRef(NaN);
    const loadingPageRef = useRef(false);

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

    if (!room || phase === RoomPhase.Connecting || phase === RoomPhase.Disconnecting) {
        loadingPageRef.current = true;
    } else {
        if (classRoomStore.isCreator && classRoomStore.roomStatus === RoomStatus.Idle) {
            void classRoomStore.startClass();
        }
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
        <div className="realtime-container">
            {loadingPageRef.current && <LoadingPage onTimeout="full-reload" />}
            <div className="realtime-box">
                <TopBar
                    center={renderTopBarCenter()}
                    isMac={runtime.isMac}
                    left={renderTopBarLeft()}
                    right={renderTopBarRight()}
                />
                {classRoomStore.isRTCJoined && renderAvatars()}
                <div className="realtime-content">
                    <div className="container">
                        <ShareScreen shareScreenStore={shareScreenStore} />
                        <ShareScreenPicker
                            handleOk={() => {
                                shareScreenStore.enable();
                            }}
                            shareScreenStore={shareScreenStore}
                        />
                        <Whiteboard
                            classRoomStore={classRoomStore}
                            disableHandRaising={
                                classRoomStore.classMode === ClassModeType.Interaction
                            }
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

    function renderAvatars(): React.ReactNode {
        return (
            <div className="realtime-avatars-wrap">
                <div className="realtime-avatars">
                    <SmallClassAvatar
                        avatarUser={classRoomStore.users.creator}
                        generateAvatar={generateAvatar}
                        isAvatarUserCreator={true}
                        isCreator={true}
                        rtcEngine={classRoomStore.rtc.rtcEngine}
                        updateDeviceState={classRoomStore.updateDeviceState}
                        userUUID={classRoomStore.userUUID}
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
                {!classRoomStore.isCreator ? (
                    <RoomInfo
                        roomStatus={classRoomStore.roomStatus}
                        roomType={classRoomStore.roomInfo?.roomType}
                    />
                ) : (
                    classRoomStore.roomInfo?.beginTime && (
                        <Countdown
                            state={
                                classRoomStore.roomStatus !== RoomStatus.Started
                                    ? "paused"
                                    : "started"
                            }
                            beginTime={classRoomStore.roomInfo.beginTime}
                        />
                    )
                )}
            </>
        );
    }

    function renderClassMode(): React.ReactNode {
        return classRoomStore.classMode === ClassModeType.Lecture ? (
            <TopBarRoundBtn
                dark
                iconName="class-interaction"
                title={t("lecture-mode")}
                onClick={classRoomStore.toggleClassMode}
            >
                {t("switch-to-interactive-mode")}
            </TopBarRoundBtn>
        ) : (
            <TopBarRoundBtn
                dark
                iconName="class-lecture"
                title={t("interactive-mode")}
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
        return (
            <>
                {renderClassMode()}
                {classRoomStore.isCreator && classRoomStore.roomStatus === RoomStatus.Started && (
                    <RecordButton
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
            </>
        );
    }

    function renderTopBarRight(): React.ReactNode {
        return (
            <>
                {whiteboardStore.isWritable && <AppStoreButton addApp={whiteboardStore.addApp} />}

                {whiteboardStore.isWritable && !shareScreenStore.existOtherShareScreen && (
                    <TopBarRightBtn
                        icon={
                            shareScreenStore.enableShareScreenStatus ? (
                                <img src={shareScreenActiveSVG} />
                            ) : (
                                <img src={shareScreenSVG} />
                            )
                        }
                        title="Share Screen"
                        onClick={handleShareScreen}
                    />
                )}

                {/* TODO: open cloud-storage sub window */}
                <CloudStorageButton classroom={classRoomStore} />
                <InviteButton roomInfo={classRoomStore.roomInfo} />
                <TopBarRightBtn
                    icon={<img src={exitSVG} />}
                    title="Exit"
                    onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
                />
                <TopBarDivider />
                <TopBarRightBtn
                    icon={
                        isRealtimeSideOpen ? (
                            <img src={hideSideActiveSVG} />
                        ) : (
                            <img src={hideSideSVG} />
                        )
                    }
                    title={isRealtimeSideOpen ? "hide side panel" : "show side panel"}
                    onClick={() => openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen)}
                />
            </>
        );
    }

    function renderRealtimePanel(): React.ReactNode {
        return (
            <RealtimePanel
                chatSlot={<ChatPanel classRoomStore={classRoomStore}></ChatPanel>}
                isShow={isRealtimeSideOpen}
                isVideoOn={false}
                videoSlot={null}
            />
        );
    }

    function renderAvatar(user: User): React.ReactNode {
        return (
            <SmallClassAvatar
                key={user.userUUID}
                avatarUser={user}
                generateAvatar={generateAvatar}
                isCreator={classRoomStore.isCreator}
                rtcEngine={classRoomStore.rtc.rtcEngine}
                updateDeviceState={classRoomStore.updateDeviceState}
                userUUID={classRoomStore.userUUID}
            />
        );
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
