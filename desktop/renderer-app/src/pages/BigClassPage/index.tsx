import "./BigClassPage.less";

import { message } from "antd";
import classNames from "classnames";
import {
    NetworkStatus,
    RoomInfo,
    RecordHintTips,
    RecordButton,
    TopBar,
    TopBarDivider,
    LoadingPage,
} from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomPhase } from "white-web-sdk";
import { useTranslation } from "react-i18next";
import { AgoraCloudRecordBackgroundConfigItem } from "../../api-middleware/flatServer/agora";
import { RoomStatus, RoomType } from "../../api-middleware/flatServer/constants";
import { RtcChannelType } from "../../api-middleware/rtc";
import { ChatPanel } from "../../components/ChatPanel";
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import {
    ExitRoomConfirm,
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../../components/ExitRoomConfirm";
import InviteButton from "../../components/InviteButton";
import { RealtimePanel } from "../../components/RealtimePanel";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { Whiteboard } from "../../components/Whiteboard";
import {
    RecordingConfig,
    RoomStatusLoadingType,
    useClassRoomStore,
    User,
} from "../../stores/class-room-store";
import { usePowerSaveBlocker } from "../../utils/hooks/use-power-save-blocker";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import { useAutoRun, useReaction } from "../../utils/mobx";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { BigClassAvatar } from "./BigClassAvatar";
import { runtime } from "../../utils/runtime";
import { ShareScreen, ShareScreenPicker } from "../../components/ShareScreen";
import { generateAvatar } from "../../utils/generate-avatar";
import { AppStoreButton } from "../../components/AppStoreButton";

const recordingConfig: RecordingConfig = Object.freeze({
    channelType: RtcChannelType.Broadcast,
    transcodingConfig: {
        width: 288,
        height: 216,
        // https://docs.agora.io/cn/cloud-recording/recording_video_profile
        fps: 15,
        bitrate: 280,
        mixedVideoLayout: 3,
        backgroundColor: "#000000",
        defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
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
});

export type BigClassPageProps = {};

export const BigClassPage = observer<BigClassPageProps>(function BigClassPage() {
    usePowerSaveBlocker();
    useWindowSize("Class");
    const { i18n, t } = useTranslation();
    const params = useParams<RouteParams<RouteNameType.BigClassPage>>();

    const classRoomStore = useClassRoomStore({
        ...params,
        recordingConfig,
        i18n,
    });
    const whiteboardStore = classRoomStore.whiteboardStore;
    const shareScreenStore = classRoomStore.shareScreenStore;

    const globalStore = useContext(GlobalStoreContext);
    const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classRoomStore);

    const [speakingJoiner, setSpeakingJoiner] = useState<User | undefined>(() =>
        classRoomStore.users.speakingJoiners.length > 0
            ? classRoomStore.users.speakingJoiners[0]
            : void 0,
    );
    const [mainSpeaker, setMainSpeaker] = useState<User | undefined>(speakingJoiner);
    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    const updateLayoutTimeoutRef = useRef(NaN);
    const loadingPageRef = useRef(false);

    // control whiteboard writable
    useEffect(() => {
        if (!classRoomStore.isCreator && classRoomStore.users.currentUser) {
            void whiteboardStore.updateWritable(classRoomStore.users.currentUser.isSpeak);
        }
        // dumb exhaustive-deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classRoomStore.users.currentUser?.isSpeak]);

    useAutoRun(() => {
        if (classRoomStore.users.speakingJoiners.length <= 0) {
            setSpeakingJoiner(void 0);
            setMainSpeaker(
                classRoomStore.users.creator?.isSpeak ? classRoomStore.users.creator : void 0,
            );
            return;
        }

        // only one user is allowed to speak in big class
        const user = classRoomStore.users.speakingJoiners[0];

        setSpeakingJoiner(user);
        setMainSpeaker(user);

        // is current user speaking
        if (classRoomStore.userUUID === user.userUUID) {
            classRoomStore.rtc.rtcEngine.setClientRole(user.isSpeak ? 1 : 2);
        }
    });

    useReaction(
        () => classRoomStore.isCalling,
        (prevCalling, currCalling) => {
            if (!prevCalling && currCalling) {
                openRealtimeSide(true);
            }
        },
    );

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
    }, [speakingJoiner, mainSpeaker, classRoomStore.isRecording]);

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
        <div className="realtime-container">
            {loadingPageRef.current && <LoadingPage />}
            <div className="realtime-box">
                <TopBar
                    isMac={runtime.isMac}
                    left={renderTopBarLeft()}
                    center={renderTopBarCenter()}
                    right={renderTopBarRight()}
                />
                <div className="realtime-content">
                    <div className="container">
                        <ShareScreen shareScreenStore={shareScreenStore} />
                        <ShareScreenPicker
                            shareScreenStore={shareScreenStore}
                            handleOk={() => {
                                shareScreenStore.enable();
                            }}
                        />
                        <Whiteboard
                            whiteboardStore={whiteboardStore}
                            classRoomStore={classRoomStore}
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
                {!classRoomStore.isCreator && (
                    <RoomInfo roomStatus={classRoomStore.roomStatus} roomType={RoomType.BigClass} />
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

                {/* TODO: open cloud-storage sub window */}
                <CloudStorageButton classroom={classRoomStore} />
                <InviteButton roomInfo={classRoomStore.roomInfo} />
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
        const { creator } = classRoomStore.users;

        const isCreatorMini = Boolean(
            mainSpeaker && creator && mainSpeaker.userUUID !== creator.userUUID,
        );

        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={classRoomStore.isRTCJoined}
                videoSlot={
                    classRoomStore.isRTCJoined && (
                        <div className="whiteboard-rtc-box">
                            <div
                                className={classNames("whiteboard-rtc-avatar", {
                                    "is-mini": isCreatorMini,
                                })}
                            >
                                <BigClassAvatar
                                    isCreator={classRoomStore.isCreator}
                                    userUUID={classRoomStore.userUUID}
                                    avatarUser={creator}
                                    isAvatarUserCreator={true}
                                    rtcEngine={classRoomStore.rtc.rtcEngine}
                                    updateDeviceState={classRoomStore.updateDeviceState}
                                    mini={isCreatorMini}
                                    onExpand={onVideoAvatarExpand}
                                    generateAvatar={generateAvatar}
                                />
                            </div>

                            {speakingJoiner && (
                                <div
                                    className={classNames("whiteboard-rtc-avatar", {
                                        "is-mini": mainSpeaker !== speakingJoiner,
                                    })}
                                >
                                    <BigClassAvatar
                                        isCreator={classRoomStore.isCreator}
                                        avatarUser={speakingJoiner}
                                        userUUID={classRoomStore.userUUID}
                                        rtcEngine={classRoomStore.rtc.rtcEngine}
                                        updateDeviceState={classRoomStore.updateDeviceState}
                                        mini={mainSpeaker !== speakingJoiner}
                                        onExpand={onVideoAvatarExpand}
                                        generateAvatar={generateAvatar}
                                    />
                                </div>
                            )}
                        </div>
                    )
                }
                chatSlot={
                    <ChatPanel
                        classRoomStore={classRoomStore}
                        disableMultipleSpeakers={true}
                    ></ChatPanel>
                }
            />
        );
    }

    function handleSideOpenerSwitch(): void {
        openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
    }

    function onVideoAvatarExpand(): void {
        setMainSpeaker(mainSpeaker =>
            mainSpeaker?.userUUID === classRoomStore.users.creator?.userUUID
                ? speakingJoiner
                : classRoomStore.users.creator ?? void 0,
        );
    }

    function stopClass(): void {
        confirm(ExitRoomConfirmType.StopClassButton);
    }

    function updateCloudRecordLayout(): void {
        const backgroundConfig: AgoraCloudRecordBackgroundConfigItem[] = [];

        if (mainSpeaker) {
            backgroundConfig.push({
                uid: String(mainSpeaker.rtcUID),
                image_url: mainSpeaker.avatar,
            });
        }

        if (speakingJoiner) {
            backgroundConfig.push({
                uid: String(speakingJoiner.rtcUID),
                image_url: speakingJoiner.avatar,
            });
        }

        classRoomStore.updateRecordingLayout({
            mixedVideoLayout: 3,
            backgroundColor: "#000000",
            defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
            backgroundConfig,
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
        });
    }
});

export default BigClassPage;
