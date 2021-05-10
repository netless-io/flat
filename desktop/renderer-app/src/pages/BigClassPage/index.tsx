import { message } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomPhase, ViewMode } from "white-web-sdk";
import { AgoraCloudRecordBackgroundConfigItem } from "../../apiMiddleware/flatServer/agora";
import { RoomStatus, RoomType } from "../../apiMiddleware/flatServer/constants";
import { RtcChannelType } from "../../apiMiddleware/Rtc";
import { ChatPanel } from "../../components/ChatPanel";
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import { ExitRoomConfirm, ExitRoomConfirmType } from "../../components/ExitRoomConfirm";
import InviteButton from "../../components/InviteButton";
import { NetworkStatus } from "../../components/NetworkStatus";
import { RealtimePanel } from "../../components/RealtimePanel";
import { RecordButton } from "../../components/RecordButton";
import { RecordHintTips } from "../../components/RecordHintTips";
import { RoomInfo } from "../../components/RoomInfo";
import { TopBar, TopBarDivider } from "../../components/TopBar";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { Whiteboard } from "../../components/Whiteboard";
import LoadingPage from "../../LoadingPage";
import {
    RecordingConfig,
    RoomStatusLoadingType,
    useClassRoomStore,
    User,
} from "../../stores/ClassRoomStore";
import { usePowerSaveBlocker } from "../../utils/hooks/usePowerSaveBlocker";
import { useWindowSize } from "../../utils/hooks/useWindowSize";
import { useAutoRun, useReaction } from "../../utils/mobx";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { BigClassAvatar } from "./BigClassAvatar";
import "./BigClassPage.less";

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
    // @TODO remove ref
    const exitRoomConfirmRef = useRef((_confirmType: ExitRoomConfirmType) => {});

    const params = useParams<RouteParams<RouteNameType.BigClassPage>>();

    const classRoomStore = useClassRoomStore(params.roomUUID, params.ownerUUID, recordingConfig);
    const whiteboardStore = classRoomStore.whiteboardStore;

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
            whiteboardStore.updateWritable(classRoomStore.users.currentUser.isSpeak);
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
        return <LoadingPage />;
    }

    return (
        <div className="realtime-box">
            <TopBar
                left={renderTopBarLeft()}
                center={renderTopBarCenter()}
                right={renderTopBarRight()}
            />
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
        const { creator } = classRoomStore.users;

        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={Boolean(creator || speakingJoiner)}
                videoSlot={
                    <div
                        className={classNames("whiteboard-rtc-box", {
                            "with-small": speakingJoiner,
                        })}
                    >
                        {creator && (
                            <div
                                className={classNames("whiteboard-rtc-avatar", {
                                    "is-small":
                                        mainSpeaker && mainSpeaker.userUUID !== creator.userUUID,
                                })}
                            >
                                <BigClassAvatar
                                    isCreator={classRoomStore.isCreator}
                                    userUUID={classRoomStore.userUUID}
                                    avatarUser={creator}
                                    rtcEngine={classRoomStore.rtc.rtcEngine}
                                    updateDeviceState={classRoomStore.updateDeviceState}
                                    small={mainSpeaker && mainSpeaker.userUUID !== creator.userUUID}
                                    onExpand={onVideoAvatarExpand}
                                />
                            </div>
                        )}
                        {speakingJoiner && (
                            <div
                                className={classNames("whiteboard-rtc-avatar", {
                                    "is-small": mainSpeaker !== speakingJoiner,
                                })}
                            >
                                <BigClassAvatar
                                    isCreator={classRoomStore.isCreator}
                                    avatarUser={speakingJoiner}
                                    userUUID={classRoomStore.userUUID}
                                    rtcEngine={classRoomStore.rtc.rtcEngine}
                                    updateDeviceState={classRoomStore.updateDeviceState}
                                    small={mainSpeaker !== speakingJoiner}
                                    onExpand={onVideoAvatarExpand}
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

    function onVideoAvatarExpand(): void {
        setMainSpeaker(mainSpeaker =>
            mainSpeaker?.userUUID === classRoomStore.users.creator?.userUUID
                ? speakingJoiner
                : classRoomStore.users.creator ?? void 0,
        );
    }

    function stopClass(): void {
        // @TODO remove ref
        exitRoomConfirmRef.current(ExitRoomConfirmType.StopClassButton);
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
