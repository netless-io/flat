import "./OneToOnePage.less";

import React, { useContext } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import {
    NetworkStatus,
    TopBar,
    TopBarRightBtn,
    TopBarDivider,
    Timer,
    CloudRecordBtn,
    SVGScreenSharing,
    SVGExit,
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
import { UsersButton } from "../components/UsersButton";
import { Shortcuts, Rewards } from "../components/Shortcuts";
import { PreferencesButton } from "../components/PreferencesButton";
import { ClosableMessage } from "../components/ClosableMessage";

export type OneToOnePageProps = {};

export const OneToOnePage = withClassroomStore<OneToOnePageProps>(
    observer<WithClassroomStoreProps<OneToOnePageProps>>(function OneToOnePage({ classroomStore }) {
        useLoginCheck();

        const t = useTranslate();

        const whiteboardStore = classroomStore.whiteboardStore;
        const windowsBtn = useContext(WindowsSystemBtnContext);

        const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);

        const isRealtimeSideOpen = !whiteboardStore.isRightSideClose;

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
                        <Shortcuts classroom={classroomStore} location="top-right" />
                        <Rewards classroom={classroomStore} />
                        <ExitRoomConfirm
                            isCreator={classroomStore.isCreator}
                            {...exitConfirmModalProps}
                        />
                        <RoomStatusStoppedModal
                            isExitConfirmModalVisible={exitConfirmModalProps.visible}
                            isRemoteLogin={classroomStore.isRemoteLogin}
                            roomStatus={classroomStore.roomStatus}
                        />
                        <ClosableMessage classroom={classroomStore} />
                    </div>
                </div>
            </div>
        );

        function renderTopBarLeft(): React.ReactNode {
            return (
                <>
                    <ExtraPadding />
                    <NetworkStatus networkQuality={classroomStore.networkQuality} />
                    {classroomStore.roomInfo?.beginTime && (
                        <Timer
                            beginTime={classroomStore.roomInfo.beginTime}
                            expireAt={classroomStore.expireAt}
                            roomStatus={classroomStore.roomStatus}
                        />
                    )}
                </>
            );
        }

        function renderTopBarRight(): React.ReactNode {
            return (
                <>
                    {whiteboardStore.allowDrawing && !classroomStore.isRemoteScreenSharing && (
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
                    {classroomStore.whiteboardStore.allowDrawing && (
                        <CloudStorageButton classroom={classroomStore} />
                    )}
                    <InviteButton roomInfo={classroomStore.roomInfo} />
                    {/* TODO: open users sub window */}
                    <UsersButton classroom={classroomStore} />
                    <PreferencesButton classroom={classroomStore} />
                    {!windowsBtn?.showWindowsBtn && (
                        <TopBarRightBtn
                            icon={<SVGExit />}
                            title={t("exit")}
                            onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
                        />
                    )}
                    {/* {windowsBtn?.showWindowsBtn ? null : <TopBarDivider />}
                    <TopBarRightBtn
                        icon={isRealtimeSideOpen ? <SVGMenuUnfold /> : <SVGMenuFold />}
                        title={isRealtimeSideOpen ? t("side-panel.hide") : t("side-panel.show")}
                        onClick={handleSideOpenerSwitch}
                    /> */}
                    {windowsBtn?.showWindowsBtn && <TopBarDivider />}
                </>
            );
        }

        function renderRealtimePanel(): React.ReactNode {
            return (
                <RealtimePanel
                    chatSlot={<ChatPanel classRoomStore={classroomStore} />}
                    classroom={classroomStore}
                    isShow={isRealtimeSideOpen}
                    isVideoOn={classroomStore.isJoinedRTC}
                    videoSlot={
                        <div className="one-to-one-rtc-avatar-container">
                            <RTCAvatar
                                avatarUser={classroomStore.users.creator}
                                getPortal={classroomStore.getPortal}
                                isAvatarUserCreator={true}
                                isCreator={classroomStore.isCreator}
                                isDropTarget={classroomStore.isDropTarget(classroomStore.ownerUUID)}
                                rtcAvatar={
                                    classroomStore.users.creator &&
                                    classroomStore.rtc.getAvatar(
                                        classroomStore.users.creator.rtcUID,
                                    )
                                }
                                updateDeviceState={classroomStore.updateDeviceState}
                                userUUID={classroomStore.userUUID}
                                onDoubleClick={() =>
                                    classroomStore.createMaximizedAvatarWindow(
                                        classroomStore.ownerUUID,
                                    )
                                }
                                onDragEnd={classroomStore.onDragEnd}
                                onDragStart={classroomStore.onDragStart}
                            />
                            {classroomStore.firstOnStageUser && (
                                <RTCAvatar
                                    avatarUser={classroomStore.firstOnStageUser}
                                    getPortal={classroomStore.getPortal}
                                    isAvatarUserCreator={false}
                                    isCreator={classroomStore.isCreator}
                                    isDropTarget={
                                        classroomStore.firstOnStageUser &&
                                        classroomStore.isDropTarget(
                                            classroomStore.firstOnStageUser.userUUID,
                                        )
                                    }
                                    rtcAvatar={
                                        classroomStore.firstOnStageUser &&
                                        classroomStore.rtc.getAvatar(
                                            classroomStore.firstOnStageUser.rtcUID,
                                        )
                                    }
                                    updateDeviceState={classroomStore.updateDeviceState}
                                    userUUID={classroomStore.userUUID}
                                    onDoubleClick={() =>
                                        classroomStore.firstOnStageUser &&
                                        classroomStore.createMaximizedAvatarWindow(
                                            classroomStore.firstOnStageUser.userUUID,
                                        )
                                    }
                                    onDragEnd={classroomStore.onDragEnd}
                                    onDragStart={classroomStore.onDragStart}
                                />
                            )}
                        </div>
                    }
                />
            );
        }

        // function handleSideOpenerSwitch(): void {
        //     whiteboardStore.setRightSideClose(isRealtimeSideOpen);
        // }
    }),
);

export default OneToOnePage;
