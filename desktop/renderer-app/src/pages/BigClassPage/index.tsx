import "./BigClassPage.less";

import { message } from "antd";
import classNames from "classnames";
import {
    NetworkStatus,
    RoomInfo,
    RecordButton,
    TopBar,
    TopBarDivider,
    LoadingPage,
    Countdown,
} from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
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
import { TopBarRightBtn } from "flat-components";
import { Whiteboard } from "../../components/Whiteboard";
import { RecordingConfig, useClassRoomStore, User } from "../../stores/class-room-store";
import { usePowerSaveBlocker } from "../../utils/hooks/use-power-save-blocker";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import { useAutoRun, useReaction } from "../../utils/mobx";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { BigClassAvatar } from "./BigClassAvatar";
import { runtime } from "../../utils/runtime";
import { ShareScreen, ShareScreenPicker } from "../../components/ShareScreen";
import { generateAvatar } from "../../utils/generate-avatar";
import { AppStoreButton } from "../../components/AppStoreButton";
import shareScreenActiveSVG from "../../assets/image/share-screen-active.svg";
import shareScreenSVG from "../../assets/image/share-screen.svg";
import exitSVG from "../../assets/image/exit.svg";
import hideSideSVG from "../../assets/image/hide-side.svg";
import hideSideActiveSVG from "../../assets/image/hide-side-active.svg";

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
        whiteboardStore.phase === RoomPhase.Disconnecting
    ) {
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
                {!classRoomStore.isCreator ? (
                    <RoomInfo
                        roomStatus={classRoomStore.roomStatus}
                        roomType={classRoomStore.roomInfo?.roomType}
                    />
                ) : classRoomStore.roomInfo?.beginTime && <Countdown state={classRoomStore.roomStatus !== RoomStatus.Started ? 'paused' : 'started'} beginTime={classRoomStore.roomInfo.beginTime} />}
            </>
        );
    }

    function renderTopBarCenter(): React.ReactNode {
        if (!classRoomStore.isCreator) {
            return null;
        }
        return (
            <>
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
                chatSlot={
                    <ChatPanel
                        classRoomStore={classRoomStore}
                        disableMultipleSpeakers={true}
                    ></ChatPanel>
                }
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
                                    avatarUser={creator}
                                    generateAvatar={generateAvatar}
                                    isAvatarUserCreator={true}
                                    isCreator={classRoomStore.isCreator}
                                    mini={isCreatorMini}
                                    rtcEngine={classRoomStore.rtc.rtcEngine}
                                    updateDeviceState={classRoomStore.updateDeviceState}
                                    userUUID={classRoomStore.userUUID}
                                    onExpand={onVideoAvatarExpand}
                                />
                            </div>

                            {speakingJoiner && (
                                <div
                                    className={classNames("whiteboard-rtc-avatar", {
                                        "is-mini": mainSpeaker !== speakingJoiner,
                                    })}
                                >
                                    <BigClassAvatar
                                        avatarUser={speakingJoiner}
                                        generateAvatar={generateAvatar}
                                        isCreator={classRoomStore.isCreator}
                                        mini={mainSpeaker !== speakingJoiner}
                                        rtcEngine={classRoomStore.rtc.rtcEngine}
                                        updateDeviceState={classRoomStore.updateDeviceState}
                                        userUUID={classRoomStore.userUUID}
                                        onExpand={onVideoAvatarExpand}
                                    />
                                </div>
                            )}
                        </div>
                    )
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
