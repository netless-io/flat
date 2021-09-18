import "./BigClassPage.less";

import { message } from "antd";
import classNames from "classnames";
import {
    LoadingPage,
    NetworkStatus,
    RecordButton,
    RecordHintTips,
    RoomInfo,
    TopBar,
    TopBarDivider,
} from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomPhase } from "white-web-sdk";
import { useTranslation } from "react-i18next";
import { AgoraCloudRecordBackgroundConfigItem } from "../../apiMiddleware/flatServer/agora";
import { RoomStatus, RoomType } from "../../apiMiddleware/flatServer/constants";
import { RtcChannelType } from "../../apiMiddleware/rtc/room";
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
import { GlobalStoreContext } from "../../components/StoreProvider";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { Whiteboard } from "../../components/Whiteboard";
import {
    RecordingConfig,
    RoomStatusLoadingType,
    useClassRoomStore,
    User,
} from "../../stores/ClassRoomStore";
import { useAutoRun, useReaction } from "../../utils/mobx";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { runtime } from "../../utils/runtime";
import { BigClassAvatar } from "./BigClassAvatar";
import { ShareScreen } from "../../components/ShareScreen";
import { generateAvatar } from "../../utils/generateAvatar";

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
    const { t } = useTranslation();
    const params = useParams<RouteParams<RouteNameType.BigClassPage>>();

    const classRoomStore = useClassRoomStore(params.roomUUID, params.ownerUUID, recordingConfig);
    const shareScreenStore = classRoomStore.shareScreenStore;

    const whiteboardStore = classRoomStore.whiteboardStore;
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
            classRoomStore.rtc.client?.setClientRole(user.isSpeak ? "host" : "audience");
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
        return <LoadingPage />;
    }

    return (
        <div className="realtime-container">
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

                {whiteboardStore.isWritable && !shareScreenStore.existOtherUserStream && (
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

                {/*
                 * TODO: After the whiteboard supports multi-window, the vision control function is disabled, so hide the function for the time being.
                 */}
                {/* {whiteboardStore.isWritable && (
                    <TopBarRightBtn
                        title="Vision control"
                        icon={
                            whiteboardStore.viewMode === ViewMode.Broadcaster
                                ? "follow-active"
                                : "follow"
                        }
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
                    icon={isRealtimeSideOpen ? "hide-side-active" : "hide-side"}
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
                isVideoOn={true}
                videoSlot={
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
                                rtc={classRoomStore.rtc}
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
                                    rtc={classRoomStore.rtc}
                                    updateDeviceState={classRoomStore.updateDeviceState}
                                    mini={mainSpeaker !== speakingJoiner}
                                    onExpand={onVideoAvatarExpand}
                                    generateAvatar={generateAvatar}
                                />
                            </div>
                        )}
                    </div>
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

    function handleShareScreen(): void {
        void shareScreenStore.toggle();
    }

    function handleSideOpenerSwitch(): void {
        openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
        whiteboardStore.setRightSideClose(isRealtimeSideOpen);
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
