import "./SmallClassPage.less";

import classNames from "classnames";
import React, { useContext, useEffect } from "react";
import { message } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import {
    NetworkStatus,
    TopBar,
    TopBarDivider,
    Timer,
    CloudRecordBtn,
    TopBarRightBtn,
    SVGScreenSharing,
    SVGExit,
    SVGLeft,
    SVGRight,
} from "flat-components";

import InviteButton from "../components/InviteButton";
import { RealtimePanel } from "../components/RealtimePanel";
import { ChatPanel } from "../components/ChatPanel";
import { RTCAvatar } from "../components/RTCAvatar";
import { Whiteboard } from "../components/Whiteboard";
import ExitRoomConfirm, {
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../components/ExitRoomConfirm";
import { RoomStatusStoppedModal } from "../components/ClassRoom/RoomStatusStoppedModal";

import { RoomStatus } from "@netless/flat-server-api";

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
import { useScrollable } from "./utils";
import { ClosableMessage } from "../components/ClosableMessage";

export type SmallClassPageProps = {};

export const SmallClassPage = withClassroomStore<SmallClassPageProps>(
    observer<WithClassroomStoreProps<SmallClassPageProps>>(function SmallClassPage({
        classroomStore,
    }) {
        useLoginCheck();
        const t = useTranslate();

        const whiteboardStore = classroomStore.whiteboardStore;
        const windowsBtn = useContext(WindowsSystemBtnContext);

        const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);

        const isRealtimeSideOpen = !whiteboardStore.isRightSideClose;

        useEffect(() => {
            if (classroomStore.isCreator && classroomStore.roomStatus === RoomStatus.Idle) {
                void classroomStore.startClass();
            }
        }, [classroomStore]);

        const { isScrollable, makeScrollable, scrollLeft, scrollRight } = useScrollable();

        return (
            <div className="small-class-page-container">
                <div className="small-class-realtime-container">
                    <div
                        className={classNames("small-class-realtime-box", {
                            "is-fold": !classroomStore.isAvatarsVisible(),
                        })}
                    >
                        {windowsBtn ? (
                            <TopBar
                                center={renderTopBarCenter()}
                                left={renderTopBarLeft()}
                                right={renderTopBarRight()}
                                showWindowsSystemBtn={windowsBtn.showWindowsBtn}
                                onClickWindowsSystemBtn={windowsBtn.onClickWindowsSystemBtn}
                                onDoubleClick={windowsBtn.clickWindowMaximize}
                            />
                        ) : (
                            <TopBar
                                center={renderTopBarCenter()}
                                left={renderTopBarLeft()}
                                right={renderTopBarRight()}
                            />
                        )}
                        {renderAvatars()}
                        <div className="small-class-realtime-content">
                            <div className="small-class-realtime-content-container">
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
                            isExitConfirmModalVisible={exitConfirmModalProps.visible}
                            isRemoteLogin={classroomStore.isRemoteLogin}
                            roomStatus={classroomStore.roomStatus}
                        />
                        <ClosableMessage classroom={classroomStore} />
                    </div>
                </div>
            </div>
        );

        function renderAvatars(): React.ReactNode {
            return (
                <div className="small-class-realtime-avatars-wrap-wrap">
                    <div
                        ref={makeScrollable}
                        className="small-class-realtime-avatars-wrap"
                        hidden={!classroomStore.isAvatarsVisible()}
                    >
                        {classroomStore.isJoinedRTC && (
                            <div
                                className="small-class-realtime-avatars"
                                data-user-uuid="[object Object]"
                            >
                                <RTCAvatar
                                    avatarUser={classroomStore.users.creator}
                                    getPortal={classroomStore.getPortal}
                                    isAvatarUserCreator={true}
                                    isCreator={classroomStore.isCreator}
                                    isDropTarget={classroomStore.isDropTarget(
                                        classroomStore.ownerUUID,
                                    )}
                                    rtcAvatar={
                                        classroomStore.users.creator &&
                                        classroomStore.rtc.getAvatar(
                                            classroomStore.users.creator.rtcUID,
                                        )
                                    }
                                    small={true}
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
                                {classroomStore.onStageUserUUIDs.map(renderAvatar)}
                            </div>
                        )}
                    </div>
                    <div
                        className={classNames("small-class-scroll-handles", {
                            active: isScrollable,
                        })}
                        hidden={!classroomStore.isAvatarsVisible()}
                    >
                        <button
                            className="small-class-scroll-handle is-left"
                            title="press shift to scroll 5x faster"
                            onClick={scrollLeft}
                        >
                            <span className="small-class-scroll-handle-btn">
                                <SVGLeft active />
                            </span>
                        </button>
                        <button
                            className="small-class-scroll-handle is-right"
                            title="press shift to scroll 5x faster"
                            onClick={scrollRight}
                        >
                            <span className="small-class-scroll-handle-btn">
                                <SVGRight active />
                            </span>
                        </button>
                    </div>
                    <Shortcuts classroom={classroomStore} />
                    <Rewards classroom={classroomStore} />
                </div>
            );
        }

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

        // function renderClassMode(): React.ReactNode {
        //     return classroomStore.classMode === ClassModeType.Lecture ? (
        //         <TopBarRoundBtn
        //             dark
        //             icon={<SVGModeLecture />}
        //             title={t("switch-to-interactive-mode")}
        //             onClick={classroomStore.toggleClassMode}
        //         >
        //             {t("lecture-mode")}
        //         </TopBarRoundBtn>
        //     ) : (
        //         <TopBarRoundBtn
        //             dark
        //             icon={<SVGModeInteractive />}
        //             title={t("switch-to-lecture-mode")}
        //             onClick={classroomStore.toggleClassMode}
        //         >
        //             {t("interactive-mode")}
        //         </TopBarRoundBtn>
        //     );
        // }

        function renderTopBarCenter(): React.ReactNode {
            if (classroomStore.isAvatarsVisible()) {
                return null;
            } else {
                return <div className="topbar-content-dimmed">{t("avatars-hidden")}</div>;
            }
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
                        onClick={() => {
                            openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
                            whiteboardStore.setRightSideClose(isRealtimeSideOpen);
                        }}
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
                    isVideoOn={false}
                    videoSlot={null}
                />
            );
        }

        function renderAvatar(userUUID: string): React.ReactNode {
            const user = classroomStore.users.cachedUsers.get(userUUID);
            return (
                <RTCAvatar
                    key={userUUID}
                    avatarUser={user}
                    getPortal={classroomStore.getPortal}
                    isAvatarUserCreator={false}
                    isCreator={classroomStore.isCreator}
                    isDropTarget={classroomStore.isDropTarget(userUUID)}
                    rtcAvatar={user && classroomStore.rtc.getAvatar(user.rtcUID)}
                    small={true}
                    updateDeviceState={(uid, camera, mic) => {
                        // Disallow toggling mic when not speak.
                        const _mic =
                            whiteboardStore.isWritable ||
                            !user ||
                            user.userUUID === classroomStore.ownerUUID ||
                            user.userUUID !== classroomStore.users.currentUser?.userUUID
                                ? mic
                                : user.mic;
                        classroomStore.updateDeviceState(uid, camera, _mic);
                    }}
                    userUUID={classroomStore.userUUID}
                    onDoubleClick={() =>
                        user && classroomStore.createMaximizedAvatarWindow(user.userUUID)
                    }
                    onDragEnd={classroomStore.onDragEnd}
                    onDragStart={classroomStore.onDragStart}
                />
            );
        }
    }),
);

export default SmallClassPage;
