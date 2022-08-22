import "./SmallClassPage.less";

import React, { useContext, useEffect, useState } from "react";
import { message } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import {
    NetworkStatus,
    RoomInfo,
    TopBar,
    TopBarDivider,
    Timer,
    CloudRecordBtn,
    TopBarRightBtn,
    SVGScreenSharing,
    SVGExit,
    SVGMenuFold,
    SVGMenuUnfold,
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
import { ClassModeType, User } from "@netless/flat-stores";

import { CloudStorageButton } from "../components/CloudStorageButton";
import { ShareScreen } from "../components/ShareScreen";
import { useLoginCheck } from "../utils/use-login-check";
import { withClassroomStore, WithClassroomStoreProps } from "../utils/with-classroom-store";
import { WindowsSystemBtnContext } from "../components/StoreProvider";

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

        const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

        useEffect(() => {
            if (classroomStore.isCreator && classroomStore.roomStatus === RoomStatus.Idle) {
                void classroomStore.startClass();
            }
        }, [classroomStore]);

        return (
            <div className="small-class-page-container">
                <div className="small-class-realtime-container">
                    <div className="small-class-realtime-box">
                        {windowsBtn ? (
                            <TopBar
                                // center={renderTopBarCenter()}
                                left={renderTopBarLeft()}
                                right={renderTopBarRight()}
                                showWindowsSystemBtn={windowsBtn.showWindowsBtn}
                                onClickWindowsSystemBtn={windowsBtn.onClickWindowsSystemBtn}
                                onDoubleClick={windowsBtn.clickWindowMaximize}
                            />
                        ) : (
                            <TopBar left={renderTopBarLeft()} right={renderTopBarRight()} />
                        )}
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
                            {classroomStore.users.speakingJoiners.map(renderAvatar)}
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

        // function renderTopBarCenter(): React.ReactNode {
        //     if (!classroomStore.isCreator) {
        //         return null;
        //     }
        //     return renderClassMode();
        // }

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
                        onClick={() => {
                            openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
                            whiteboardStore.setRightSideClose(isRealtimeSideOpen);
                        }}
                    />
                    {windowsBtn?.showWindowsBtn && <TopBarDivider />}
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
    }),
);

export default SmallClassPage;
