import "./BigClassPage.less";

import { message } from "antd";
import {
    CloudRecordBtn,
    Timer,
    LoadingPage,
    NetworkStatus,
    RoomInfo,
    TopBar,
    TopBarDivider,
    TopBarRightBtn,
    SVGExit,
    SVGMenuUnfold,
    SVGMenuFold,
    SVGScreenSharing,
} from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomPhase } from "white-web-sdk";
import { useTranslation } from "react-i18next";
import { FlatRTCRole } from "@netless/flat-rtc";
import { AgoraCloudRecordBackgroundConfigItem, RoomStatus } from "@netless/flat-server-api";
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
import { Whiteboard } from "../../components/Whiteboard";
import { User } from "@netless/flat-stores";
import { useAutoRun } from "../../utils/mobx";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { runtime } from "../../utils/runtime";
import { RTCAvatar } from "../../components/RTCAvatar";
import { ShareScreen } from "../../components/ShareScreen";
import { useLoginCheck } from "../utils/use-login-check";
import { useClassroomStore } from "../../stores/use-classroom-store";

export type BigClassPageProps = {};

export const BigClassPage = observer<BigClassPageProps>(function BigClassPage() {
    useLoginCheck();

    const { t } = useTranslation();
    const params = useParams<RouteParams<RouteNameType.BigClassPage>>();

    const classRoomStore = useClassroomStore(params);

    const whiteboardStore = classRoomStore.whiteboardStore;

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
            void classRoomStore.rtc.setRole(user.isSpeak ? FlatRTCRole.Host : FlatRTCRole.Audience);
        }
    });

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

    return (
        <div className="big-class-realtime-container">
            {loadingPageRef.current && <LoadingPage onTimeout="full-reload" />}
            <div className="big-class-realtime-box">
                <TopBar
                    isMac={runtime.isMac}
                    left={renderTopBarLeft()}
                    right={renderTopBarRight()}
                />
                <div className="big-class-realtime-content">
                    <div className="big-class-realtime-content-container">
                        <ShareScreen classRoomStore={classRoomStore} />
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
        const { creator } = classRoomStore.users;

        return (
            <RealtimePanel
                chatSlot={
                    <ChatPanel
                        classRoomStore={classRoomStore}
                        disableMultipleSpeakers={true}
                        isShowAllOfStage={classRoomStore.isCreator}
                    ></ChatPanel>
                }
                isShow={isRealtimeSideOpen}
                isVideoOn={classRoomStore.isJoinedRTC}
                videoSlot={
                    <div className="big-class-realtime-rtc-box">
                        <RTCAvatar
                            avatarUser={creator}
                            isAvatarUserCreator={true}
                            isCreator={classRoomStore.isCreator}
                            rtcAvatar={creator && classRoomStore.rtc.getAvatar(creator.rtcUID)}
                            updateDeviceState={classRoomStore.updateDeviceState}
                            userUUID={classRoomStore.userUUID}
                        />
                        {speakingJoiner && (
                            <RTCAvatar
                                avatarUser={speakingJoiner}
                                isAvatarUserCreator={false}
                                isCreator={classRoomStore.isCreator}
                                rtcAvatar={classRoomStore.rtc.getAvatar(speakingJoiner.rtcUID)}
                                updateDeviceState={classRoomStore.updateDeviceState}
                                userUUID={classRoomStore.userUUID}
                            />
                        )}
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
    }
});

export default BigClassPage;
