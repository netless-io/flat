import "./OneToOnePage.less";

import React, { useContext, useState } from "react";
import { useTranslate } from "@netless/flat-i18n";
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
import { CloudStorageButton } from "../components/CloudStorageButton";
import { ShareScreen } from "../components/ShareScreen";
import { useLoginCheck } from "../utils/use-login-check";
import { withClassroomStore, WithClassroomStoreProps } from "../utils/with-classroom-store";
import { WindowsSystemBtnContext } from "../components/StoreProvider";
import { ShareScreenPicker } from "../components/ShareScreen/ShareScreenPicker";
import { ExtraPadding } from "../components/ExtraPadding";

export type OneToOnePageProps = {};

export const OneToOnePage = withClassroomStore<OneToOnePageProps>(
    observer<WithClassroomStoreProps<OneToOnePageProps>>(function OneToOnePage({ classroomStore }) {
        useLoginCheck();

        const t = useTranslate();

        const whiteboardStore = classroomStore.whiteboardStore;
        const windowsBtn = useContext(WindowsSystemBtnContext);

        const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);

        const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

        return (
            <div className="one-to-one-class-page-container">
                <div className="one-to-one-realtime-container">
                    <div className="one-to-one-realtime-box">
                        {windowsBtn ? (
                            <TopBar
                                left={renderTopBarLeft()}
                                right={renderTopBarRight()}
                                showWindowsSystemBtn={windowsBtn.showWindowsBtn}
                                onClickWindowsSystemBtn={windowsBtn.onClickWindowsSystemBtn}
                                onDoubleClick={windowsBtn.clickWindowMaximize}
                            />
                        ) : (
                            <TopBar left={renderTopBarLeft()} right={renderTopBarRight()} />
                        )}
                        <div className="one-to-one-realtime-content">
                            <div className="one-to-one-realtime-content-container">
                                <ShareScreen classroomStore={classroomStore} />
                                <ShareScreenPicker
                                    classroomStore={classroomStore}
                                    handleOk={() => classroomStore.toggleShareScreen(true)}
                                />
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
            </div>
        );

        function renderTopBarLeft(): React.ReactNode {
            return (
                <>
                    <ExtraPadding />
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
                            onClick={() => {
                                if (window.isElectron) {
                                    if (classroomStore.isScreenSharing) {
                                        classroomStore.toggleShareScreen(false);
                                    } else {
                                        classroomStore.toggleShareScreenPicker(true);
                                    }
                                } else {
                                    classroomStore.toggleShareScreen();
                                }
                            }}
                        />
                    )}

                    {classroomStore.isCreator && (
                        <CloudRecordBtn
                            isRecording={classroomStore.isRecording}
                            loading={classroomStore.isRecordingLoading}
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
                    {!windowsBtn?.showWindowsBtn && (
                        <TopBarRightBtn
                            icon={<SVGExit />}
                            title={t("exit")}
                            onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
                        />
                    )}
                    {windowsBtn?.showWindowsBtn ? null : <TopBarDivider />}
                    <TopBarRightBtn
                        icon={isRealtimeSideOpen ? <SVGMenuUnfold /> : <SVGMenuFold />}
                        title={isRealtimeSideOpen ? t("side-panel.hide") : t("side-panel.show")}
                        onClick={handleSideOpenerSwitch}
                    />
                    {windowsBtn?.showWindowsBtn && <TopBarDivider />}
                </>
            );
        }

        function renderRealtimePanel(): React.ReactNode {
            return (
                <RealtimePanel
                    chatSlot={
                        <ChatPanel
                            classRoomStore={classroomStore}
                            disableEndSpeaking={false}
                            maxSpeakingUsers={1}
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
                            {classroomStore.firstOnStageUser && (
                                <RTCAvatar
                                    avatarUser={classroomStore.firstOnStageUser}
                                    isAvatarUserCreator={false}
                                    isCreator={classroomStore.isCreator}
                                    rtcAvatar={
                                        classroomStore.firstOnStageUser &&
                                        classroomStore.rtc.getAvatar(
                                            classroomStore.firstOnStageUser.rtcUID,
                                        )
                                    }
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

export default OneToOnePage;
