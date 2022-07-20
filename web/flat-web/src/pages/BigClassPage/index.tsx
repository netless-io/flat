import "./BigClassPage.less";

import { message } from "antd";
import {
    CloudRecordBtn,
    Timer,
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
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatRTCRole } from "@netless/flat-rtc";
import { RoomStatus } from "@netless/flat-server-api";
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
import { runtime } from "../../utils/runtime";
import { RTCAvatar } from "../../components/RTCAvatar";
import { ShareScreen } from "../../components/ShareScreen";
import { useLoginCheck } from "../utils/use-login-check";
import { withClassroomStore, WithClassroomStoreProps } from "../../stores/with-classroom-store";

export type BigClassPageProps = {};

export const BigClassPage = withClassroomStore<BigClassPageProps>(
    observer<WithClassroomStoreProps<BigClassPageProps>>(function BigClassPage({ classroomStore }) {
        useLoginCheck();

        const { t } = useTranslation();

        const whiteboardStore = classroomStore.whiteboardStore;

        const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);

        const [speakingJoiner, setSpeakingJoiner] = useState<User | undefined>();
        const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

        useAutoRun(() => {
            if (classroomStore.users.speakingJoiners.length <= 0) {
                setSpeakingJoiner(void 0);
                return;
            }

            // only one user is allowed to speak in big class
            const user = classroomStore.users.speakingJoiners[0];

            setSpeakingJoiner(user);

            // is current user speaking
            if (classroomStore.userUUID === user.userUUID) {
                void classroomStore.rtc.setRole(
                    user.isSpeak ? FlatRTCRole.Host : FlatRTCRole.Audience,
                );
            }
        });

        useEffect(() => {
            if (classroomStore.isCreator && classroomStore.roomStatus === RoomStatus.Idle) {
                void classroomStore.startClass();
            }
        }, [classroomStore]);

        return (
            <div className="big-class-realtime-container">
                <div className="big-class-realtime-box">
                    <TopBar
                        isMac={runtime.isMac}
                        left={renderTopBarLeft()}
                        right={renderTopBarRight()}
                    />
                    <div className="big-class-realtime-content">
                        <div className="big-class-realtime-content-container">
                            <ShareScreen classRoomStore={classroomStore} />
                            <Whiteboard
                                classRoomStore={classroomStore}
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
            const { creator } = classroomStore.users;

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
                    isShowAllOfStagte={classroomStore.isCreator}
                    videoSlot={
                        <div className="big-class-realtime-rtc-box">
                            <RTCAvatar
                                avatarUser={creator}
                                isAvatarUserCreator={true}
                                isCreator={classroomStore.isCreator}
                                rtcAvatar={creator && classroomStore.rtc.getAvatar(creator.rtcUID)}
                                updateDeviceState={classroomStore.updateDeviceState}
                                userUUID={classroomStore.userUUID}
                            />
                            {speakingJoiner && (
                                <RTCAvatar
                                    avatarUser={speakingJoiner}
                                    isAvatarUserCreator={false}
                                    isCreator={classroomStore.isCreator}
                                    rtcAvatar={classroomStore.rtc.getAvatar(speakingJoiner.rtcUID)}
                                    updateDeviceState={classroomStore.updateDeviceState}
                                    userUUID={classroomStore.userUUID}
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
    }),
);

export default BigClassPage;
