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
import React, { useContext, useEffect, useState } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { RoomStatus } from "@netless/flat-server-api";
import { ChatPanel } from "../components/ChatPanel";
import { RoomStatusStoppedModal } from "../components/ClassRoom/RoomStatusStoppedModal";
import { CloudStorageButton } from "../components/CloudStorageButton";
import {
    ExitRoomConfirm,
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../components/ExitRoomConfirm";
import InviteButton from "../components/InviteButton";
import { RealtimePanel } from "../components/RealtimePanel";
import { Whiteboard } from "../components/Whiteboard";
import { RTCAvatar } from "../components/RTCAvatar";
import { ShareScreen } from "../components/ShareScreen";
import { useLoginCheck } from "../utils/use-login-check";
import { withClassroomStore, WithClassroomStoreProps } from "../utils/with-classroom-store";
import { WindowsSystemBtnContext } from "../components/StoreProvider";
import { ShareScreenPicker } from "../components/ShareScreen/ShareScreenPicker";
import { ExtraPadding } from "../components/ExtraPadding";
import { UsersButton } from "../components/UsersButton";

export type BigClassPageProps = {};

export const BigClassPage = withClassroomStore<BigClassPageProps>(
    observer<WithClassroomStoreProps<BigClassPageProps>>(function BigClassPage({ classroomStore }) {
        useLoginCheck();

        const t = useTranslate();

        const whiteboardStore = classroomStore.whiteboardStore;
        const windowsBtn = useContext(WindowsSystemBtnContext);

        const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);

        const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

        useEffect(() => {
            if (classroomStore.isCreator && classroomStore.roomStatus === RoomStatus.Idle) {
                void classroomStore.startClass();
            }
        }, [classroomStore]);

        return (
            <div className="big-class-page-container">
                <div className="big-class-realtime-container">
                    <div className="big-class-realtime-box">
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
                        <div className="big-class-realtime-content">
                            <div className="big-class-realtime-content-container">
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
            const { creator } = classroomStore.users;

            return (
                <RealtimePanel
                    chatSlot={<ChatPanel classRoomStore={classroomStore} />}
                    isShow={isRealtimeSideOpen}
                    isVideoOn={classroomStore.isJoinedRTC}
                    videoSlot={
                        <div className="big-class-realtime-rtc-box">
                            <RTCAvatar
                                avatarUser={creator}
                                getPortal={classroomStore.getPortal}
                                isAvatarUserCreator={true}
                                isCreator={classroomStore.isCreator}
                                isDropTarget={classroomStore.isDropTarget(classroomStore.ownerUUID)}
                                rtcAvatar={creator && classroomStore.rtc.getAvatar(creator.rtcUID)}
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
                            {classroomStore.onStageUserUUIDs.length > 0 && (
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

        function handleSideOpenerSwitch(): void {
            openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
            whiteboardStore.setRightSideClose(isRealtimeSideOpen);
        }
    }),
);

export default BigClassPage;
