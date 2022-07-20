import "./OneToOnePage.less";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import {
    NetworkStatus,
    RoomInfo,
    TopBar,
    TopBarRightBtn,
    TopBarDivider,
    Timer,
    CloudRecordBtn,
    SVGScreenSharing,
    SVGExit,
    SVGMenuFold,
    SVGMenuUnfold,
} from "flat-components";

import InviteButton from "../components/InviteButton";
import { RealtimePanel } from "../components/RealtimePanel";
import { ChatPanel } from "../components/ChatPanel";
import { RTCAvatar } from "../components/RTCAvatar";
import {
    ExitRoomConfirm,
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../components/ExitRoomConfirm";
import { Whiteboard } from "../components/Whiteboard";
import { RoomStatusStoppedModal } from "../components/ClassRoom/RoomStatusStoppedModal";
import { RoomStatus } from "@netless/flat-server-api";
import { useComputed } from "../utils/mobx";
import { CloudStorageButton } from "../components/CloudStorageButton";
import { runtime } from "../utils/runtime";
import { ShareScreen } from "../components/ShareScreen";
import { useLoginCheck } from "../utils/use-login-check";
import { withClassroomStore, WithClassroomStoreProps } from "../utils/with-classroom-store";

export type OneToOnePageProps = {};

export const OneToOnePage = withClassroomStore<OneToOnePageProps>(
    observer<WithClassroomStoreProps<OneToOnePageProps>>(function OneToOnePage({ classroomStore }) {
        useLoginCheck();

        const { t } = useTranslation();

        const whiteboardStore = classroomStore.whiteboardStore;

        const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);

        const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

        const joiner = useComputed(() => {
            if (classroomStore.isCreator) {
                return classroomStore.users.speakingJoiners.length > 0
                    ? classroomStore.users.speakingJoiners[0]
                    : classroomStore.users.handRaisingJoiners.length > 0
                    ? classroomStore.users.handRaisingJoiners[0]
                    : classroomStore.users.otherJoiners.length > 0
                    ? classroomStore.users.otherJoiners[0]
                    : null;
            }

            return classroomStore.users.currentUser;
        }).get();

        useEffect(() => {
            if (classroomStore.isCreator && classroomStore.roomStatus === RoomStatus.Idle) {
                void classroomStore.startClass();
            }
        }, [classroomStore]);

        return (
            <div className="one-to-one-realtime-container">
                <div className="one-to-one-realtime-box">
                    <TopBar
                        isMac={runtime.isMac}
                        left={renderTopBarLeft()}
                        right={renderTopBarRight()}
                    />
                    <div className="one-to-one-realtime-content">
                        <div className="one-to-one-realtime-content-container">
                            <ShareScreen classRoomStore={classroomStore} />
                            <Whiteboard
                                classRoomStore={classroomStore}
                                disableHandRaising={true}
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
                    {/* TODO: open cloud-storage sub window */}
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
                            classRoomStore={classroomStore}
                            disableMultipleSpeakers={true}
                        ></ChatPanel>
                    }
                    isShow={isRealtimeSideOpen}
                    isVideoOn={classroomStore.isJoinedRTC}
                    videoSlot={
                        <div className="one-to-one-rtc-avatar-container">
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
                                updateDeviceState={classroomStore.updateDeviceState}
                                userUUID={classroomStore.userUUID}
                            />
                            <RTCAvatar
                                avatarUser={joiner}
                                isAvatarUserCreator={false}
                                isCreator={classroomStore.isCreator}
                                rtcAvatar={joiner && classroomStore.rtc.getAvatar(joiner.rtcUID)}
                                updateDeviceState={classroomStore.updateDeviceState}
                                userUUID={classroomStore.userUUID}
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
    }),
);

export default OneToOnePage;
