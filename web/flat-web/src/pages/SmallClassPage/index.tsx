import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { RoomPhase } from "white-web-sdk";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import {
    NetworkStatus,
    RoomInfo,
    TopBar,
    TopBarDivider,
    LoadingPage,
    Timer,
    CloudRecordBtn,
    TopBarRoundBtn,
    TopBarRightBtn,
    SVGScreenSharing,
    SVGExit,
    SVGMenuFold,
    SVGMenuUnfold,
    SVGModeInteractive,
    SVGModeLecture,
} from "flat-components";

import InviteButton from "../../components/InviteButton";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { RTCAvatar } from "../../components/RTCAvatar";
import { Whiteboard } from "../../components/Whiteboard";
import ExitRoomConfirm, {
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../../components/ExitRoomConfirm";
import { RoomStatusStoppedModal } from "../../components/ClassRoom/RoomStatusStoppedModal";

import {
    RoomStatus,
    AgoraCloudRecordBackgroundConfigItem,
    AgoraCloudRecordLayoutConfigItem,
} from "@netless/flat-server-api";
import { ClassModeType, User } from "@netless/flat-stores";

import "./SmallClassPage.less";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import { runtime } from "../../utils/runtime";
import { ShareScreen } from "../../components/ShareScreen";
import { useLoginCheck } from "../utils/use-login-check";
import { withClassroomStore, WithClassroomStoreProps } from "../../stores/with-classroom-store";

const CLASSROOM_WIDTH = 1200;
const AVATAR_AREA_WIDTH = CLASSROOM_WIDTH - 16 * 2;
const AVATAR_WIDTH = 144;
// const AVATAR_HEIGHT = 108;
const MAX_AVATAR_COUNT = 17;
const AVATAR_BAR_GAP = 4;
const AVATAR_BAR_WIDTH = (AVATAR_WIDTH + AVATAR_BAR_GAP) * MAX_AVATAR_COUNT - AVATAR_BAR_GAP;

export type SmallClassPageProps = {};

export const SmallClassPage = withClassroomStore<SmallClassPageProps>(
    observer<WithClassroomStoreProps<SmallClassPageProps>>(function SmallClassPage({
        classroomStore,
    }) {
        useLoginCheck();
        const { t } = useTranslation();

        const whiteboardStore = classroomStore.whiteboardStore;

        const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);

        const { room, phase } = whiteboardStore;

        const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

        const updateLayoutTimeoutRef = useRef(NaN);
        const loadingPageRef = useRef(false);

        useEffect(() => {
            if (classroomStore.isRecording) {
                window.clearTimeout(updateLayoutTimeoutRef.current);
                updateLayoutTimeoutRef.current = window.setTimeout(() => {
                    if (classroomStore.isRecording) {
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
        }, [classroomStore.users.totalUserCount, classroomStore.isRecording]);

        if (!room || phase === RoomPhase.Connecting || phase === RoomPhase.Disconnecting) {
            loadingPageRef.current = true;
        } else {
            if (classroomStore.isCreator && classroomStore.roomStatus === RoomStatus.Idle) {
                void classroomStore.startClass();
            }
            loadingPageRef.current = false;
        }

        return (
            <div className="small-class-realtime-container">
                {loadingPageRef.current && <LoadingPage onTimeout="full-reload" />}
                <div className="small-class-realtime-box">
                    <TopBar
                        center={renderTopBarCenter()}
                        isMac={runtime.isMac}
                        left={renderTopBarLeft()}
                        right={renderTopBarRight()}
                    />
                    {renderAvatars()}
                    <div className="small-class-realtime-content">
                        <div className="small-class-realtime-content-container">
                            <ShareScreen classRoomStore={classroomStore} />
                            <Whiteboard
                                classRoomStore={classroomStore}
                                disableHandRaising={
                                    classroomStore.classMode === ClassModeType.Interaction
                                }
                                whiteboardStore={whiteboardStore}
                            />
                        </div>
                        {renderRealtimePanel()}
                    </div>
                    <ExitRoomConfirm
                        isCreator={classroomStore.isCreator}
                        {...exitConfirmModalProps}
                    />
                    <RoomStatusStoppedModal
                        isCreator={classroomStore.isCreator}
                        isRemoteLogin={classroomStore.isRemoteLogin}
                        roomStatus={classroomStore.roomStatus}
                    />
                </div>
            </div>
        );

        function renderAvatars(): React.ReactNode {
            return (
                <div
                    className="small-class-realtime-avatars-wrap"
                    style={{ maxWidth: `${whiteboardStore.smallClassAvatarWrapMaxWidth}px` }}
                >
                    {classroomStore.isJoinedRTC && (
                        <div className="small-class-realtime-avatars">
                            <RTCAvatar
                                avatarUser={classroomStore.users.creator}
                                isAvatarUserCreator={true}
                                isCreator={classroomStore.isCreator}
                                rtcAvatar={
                                    classroomStore.users.creator &&
                                    classroomStore.rtc.getAvatar(
                                        classroomStore.users.creator.rtcUID,
                                    )
                                }
                                small={true}
                                updateDeviceState={classroomStore.updateDeviceState}
                                userUUID={classroomStore.userUUID}
                            />
                            {classroomStore.users.joiners.map(renderAvatar)}
                        </div>
                    )}
                </div>
            );
        }

        function renderTopBarLeft(): React.ReactNode {
            return (
                <>
                    <NetworkStatus networkQuality={classroomStore.networkQuality} />
                    {classroomStore.isCreator ? (
                        classroomStore.roomInfo?.beginTime && (
                            <Timer
                                beginTime={classroomStore.roomInfo.beginTime}
                                roomStatus={classroomStore.roomStatus}
                            />
                        )
                    ) : (
                        <RoomInfo
                            roomStatus={classroomStore.roomStatus}
                            roomType={classroomStore.roomInfo?.roomType}
                        />
                    )}
                </>
            );
        }

        function renderClassMode(): React.ReactNode {
            return classroomStore.classMode === ClassModeType.Lecture ? (
                <TopBarRoundBtn
                    dark
                    icon={<SVGModeLecture />}
                    title={t("switch-to-interactive-mode")}
                    onClick={classroomStore.toggleClassMode}
                >
                    {t("lecture-mode")}
                </TopBarRoundBtn>
            ) : (
                <TopBarRoundBtn
                    dark
                    icon={<SVGModeInteractive />}
                    title={t("switch-to-lecture-mode")}
                    onClick={classroomStore.toggleClassMode}
                >
                    {t("interactive-mode")}
                </TopBarRoundBtn>
            );
        }

        function renderTopBarCenter(): React.ReactNode {
            if (!classroomStore.isCreator) {
                return null;
            }
            return renderClassMode();
        }

        function renderTopBarRight(): React.ReactNode {
            return (
                <>
                    {whiteboardStore.isWritable && !classroomStore.isRemoteScreenSharing && (
                        <TopBarRightBtn
                            icon={<SVGScreenSharing active={classroomStore.isScreenSharing} />}
                            title={t("share-screen.self")}
                            onClick={() => classroomStore.toggleShareScreen()}
                        />
                    )}

                    {classroomStore.isCreator && (
                        <CloudRecordBtn
                            isRecording={classroomStore.isRecording}
                            onClick={() => {
                                void classroomStore.toggleRecording({
                                    onStop() {
                                        void message.success(t("recording-completed-tips"));
                                    },
                                });
                            }}
                        />
                    )}
                    <CloudStorageButton classroom={classroomStore} />
                    <InviteButton roomInfo={classroomStore.roomInfo} />
                    <TopBarRightBtn
                        icon={<SVGExit />}
                        title={t("exit")}
                        onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
                    />
                    <TopBarDivider />
                    <TopBarRightBtn
                        icon={isRealtimeSideOpen ? <SVGMenuUnfold /> : <SVGMenuFold />}
                        title={isRealtimeSideOpen ? t("side-panel.hide") : t("side-panel.show")}
                        onClick={() => {
                            openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
                            whiteboardStore.setRightSideClose(isRealtimeSideOpen);
                        }}
                    />
                </>
            );
        }

        function renderRealtimePanel(): React.ReactNode {
            return (
                <RealtimePanel
                    chatSlot={<ChatPanel classRoomStore={classroomStore}></ChatPanel>}
                    isShow={isRealtimeSideOpen}
                    isVideoOn={false}
                    videoSlot={null}
                />
            );
        }

        function renderAvatar(user: User): React.ReactNode {
            return (
                <RTCAvatar
                    key={user.userUUID}
                    avatarUser={user}
                    isAvatarUserCreator={false}
                    isCreator={classroomStore.isCreator}
                    rtcAvatar={classroomStore.rtc.getAvatar(user.rtcUID)}
                    small={true}
                    updateDeviceState={(uid, camera, mic) => {
                        // Disallow toggling mic when not speak.
                        const _mic =
                            whiteboardStore.isWritable ||
                            user.userUUID === classroomStore.ownerUUID ||
                            user.userUUID !== classroomStore.users.currentUser?.userUUID ||
                            classroomStore.classMode !== ClassModeType.Lecture
                                ? mic
                                : user.mic;
                        classroomStore.updateDeviceState(uid, camera, _mic);
                    }}
                    userUUID={classroomStore.userUUID}
                />
            );
        }

        function updateCloudRecordLayout(): void {
            const { allUsers } = classroomStore.users;
            const layoutConfig: AgoraCloudRecordLayoutConfigItem[] = [];
            const backgroundConfig: AgoraCloudRecordBackgroundConfigItem[] = [];

            let startX = 0;

            if (allUsers.length < 7) {
                // center the avatars
                const avatarsWidth =
                    allUsers.length * (AVATAR_WIDTH + AVATAR_BAR_GAP) - AVATAR_BAR_GAP;
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
        }
    }),
);

export default SmallClassPage;
