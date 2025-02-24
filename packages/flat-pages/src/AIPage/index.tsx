import "./AIPage.less";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { observer } from "mobx-react-lite";
import { Button, message, Modal, Popover } from "antd";
import {
    NetworkStatus,
    TopBar,
    TopBarRightBtn,
    TopBarDivider,
    Timer,
    CloudRecordBtn,
    SVGScreenSharing,
    SVGExit,
    SVGWhiteBoardOn,
    SVGWhiteBoardOff,
    SVGRate,
    SVGAIChatMsgCC,
    SVGGood,
} from "flat-components";

import { RealtimePanel } from "../components/RealtimePanel";
import { RTCAvatar } from "../components/RTCAvatar";
import { RTCAIAvatar } from "../components/RTCAIAvatar";
import {
    ExitRoomConfirm,
    ExitRoomConfirmType,
    useExitRoomConfirmModal,
} from "../components/ExitRoomConfirm";
import { Whiteboard } from "../components/Whiteboard";
import { CloudStorageButton } from "../components/CloudStorageButton";
import { useLoginCheck } from "../utils/use-login-check";
import { withClassroomStore, WithClassroomStoreProps } from "../utils/with-classroom-store";
import { WindowsSystemBtnContext } from "../components/StoreProvider";
import { ExtraPadding } from "../components/ExtraPadding";
import { PreferencesButton } from "../components/PreferencesButton";
import { Rate } from "antd";
import { CloseCircleFilled } from "@ant-design/icons/lib/icons";
import { AIChatPanel } from "../components/AIChatPanel";
import { setGradeRoom } from "@netless/flat-server-api";
import { RoomStatusStoppedModal } from "../components/ClassRoom/RoomStatusStoppedModal";
import { AITeacherRoles } from "../HomePage/MainRoomMenu/icons/constants";
import { User } from "@netless/flat-stores";

export type AIPageProps = {};

export const AIPage = withClassroomStore<AIPageProps>(
    observer<WithClassroomStoreProps<AIPageProps>>(function AIPage({ classroomStore }) {
        useLoginCheck();

        const t = useTranslate();

        const whiteboardStore = classroomStore.whiteboardStore;
        const windowsBtn = useContext(WindowsSystemBtnContext);
        const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);

        const isRealtimeSideOpen = !whiteboardStore.isRightSideClose;
        const [grade, setGrade] = useState(0);
        const [isFirst, setIsFirst] = useState(false);
        const [show, setShow] = useState(true);
        const [showRateModal, setShowRateModal] = React.useState(false);
        const [loading, setLoading] = React.useState(false);

        useEffect(() => {
            if (classroomStore.userWindowsMode === "normal") {
                setIsFirst(true);
            }
        }, []);

        useEffect(() => {
            if (classroomStore.userWindowsMode === "normal") {
                whiteboardStore.setRightSideClose(false);
            } else if (classroomStore.userWindowsMode === "maximized") {
                whiteboardStore.setRightSideClose(true);
            }
        }, [classroomStore.userWindowsMode]);

        const cc = (
            <button
                className={"video-avatar-chat-msg-btn"}
                onClick={() => {
                    setShow(!show);
                }}
            >
                <SVGAIChatMsgCC />
            </button>
        );

        const aiUser = useMemo<User | null>(() => {
            if (classroomStore.isHasAIUser) {
                const aiInfo = classroomStore.classroomStorage?.state.aiInfo || undefined;
                if (aiInfo?.rtcUID) {
                    const role = AITeacherRoles.find(role => role.key === aiInfo.role);
                    if (role) {
                        return {
                            userUUID: aiInfo.rtcUID,
                            rtcUID: aiInfo.rtcUID,
                            avatar: role.bg,
                            name: role.key,
                            camera: false,
                            mic: true,
                            isSpeak: true,
                            wbOperate: false,
                            isRaiseHand: false,
                            hasLeft: false,
                        };
                    }
                }
            }
            return null;
        }, [classroomStore.isHasAIUser]);
        const handleOk: () => Promise<void> = async () => {
            setLoading(true);
            try {
                await setGradeRoom({
                    roomUUID: classroomStore.roomUUID,
                    userUUID: classroomStore.userUUID,
                    grade,
                });
                setLoading(false);
                setShowRateModal(false);
                exitConfirmModalProps.onStopClass();
            } catch (error) {
                console.error(error);
                setLoading(false);
                setShowRateModal(false);
                exitConfirmModalProps.onCancel();
            }
        };

        return (
            (aiUser && (
                <div className="ai-page-class-page-container">
                    <div className="ai-page-realtime-container">
                        <div className="ai-page-realtime-box">
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
                            <div className="ai-page-realtime-content">
                                <div className="ai-page-realtime-content-container">
                                    <Whiteboard
                                        classRoomStore={classroomStore}
                                        whiteboardStore={whiteboardStore}
                                    />
                                </div>
                                {renderRealtimePanel()}
                            </div>
                            <ExitRoomConfirm
                                isCreator={classroomStore.isCreator}
                                rateModal={
                                    <Modal
                                        closable={false}
                                        footer={[
                                            <Button
                                                key="submit"
                                                disabled={grade <= 0}
                                                loading={loading}
                                                type="primary"
                                                onClick={handleOk}
                                            >
                                                {t("home-page-AI-teacher-modal.rate.submit")}
                                            </Button>,
                                        ]}
                                        maskClosable={false}
                                        open={true}
                                        title={
                                            <div style={{ display: "flex", alignItems: "stretch" }}>
                                                <span>
                                                    {t("home-page-AI-teacher-modal.rate.title")}{" "}
                                                </span>
                                                <SVGGood />
                                            </div>
                                        }
                                        onOk={handleOk}
                                    >
                                        <Rate
                                            character={<SVGRate active={grade > 3} />}
                                            className="ai-page-rate-ui"
                                            style={{ color: grade > 3 ? "#FE4D00" : "#007AFF" }}
                                            value={grade}
                                            onHoverChange={(grade: number) => {
                                                if (grade) {
                                                    setGrade(grade);
                                                }
                                            }}
                                        />
                                    </Modal>
                                }
                                setShowRateModal={setShowRateModal}
                                showRateModal={showRateModal}
                                {...exitConfirmModalProps}
                            />
                            <RoomStatusStoppedModal
                                isExitConfirmModalVisible={exitConfirmModalProps.visible}
                                isRemoteLogin={classroomStore.isRemoteLogin}
                                roomStatus={classroomStore.roomStatus}
                            />
                        </div>
                    </div>
                </div>
            )) ||
            null
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
                    {classroomStore.whiteboardStore.allowDrawing && (
                        <Popover
                            color={"#5B9AFF"}
                            content={
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-around",
                                        alignItems: "center",
                                        minWidth: "188px",
                                        height: "37px",
                                        boxSizing: "border-box",
                                        color: "white",
                                        padding: "0 8px",
                                    }}
                                >
                                    {t("home-page-AI-teacher-class.guidance.TurnOffWhiteboard")}
                                    &nbsp;
                                    <CloseCircleFilled
                                        onClick={() => {
                                            setIsFirst(false);
                                        }}
                                    />
                                </div>
                            }
                            open={(isFirst && classroomStore.userWindowsMode === "normal") || false}
                            overlayInnerStyle={{
                                borderRadius: "8px",
                            }}
                        >
                            <TopBarRightBtn
                                icon={
                                    classroomStore.userWindowsMode === "normal" ? (
                                        <SVGWhiteBoardOff active={true} />
                                    ) : (
                                        <SVGWhiteBoardOn />
                                    )
                                }
                                title={
                                    classroomStore.userWindowsMode === "normal"
                                        ? t("home-page-AI-teacher-class.icon.TurnOffWhiteboard")
                                        : t("home-page-AI-teacher-class.icon.TurnOnWhiteboard")
                                }
                                onClick={() => {
                                    if (classroomStore.userWindowsMode === "normal") {
                                        if (isFirst) {
                                            setIsFirst(false);
                                        }
                                        classroomStore.createMaximizedAvatarWindow(
                                            classroomStore.ownerUUID,
                                        );
                                        aiUser &&
                                            classroomStore.createMaximizedAvatarWindow(
                                                aiUser.userUUID,
                                            );
                                    } else {
                                        classroomStore.toggleUserWindowsMode("normal");
                                    }
                                }}
                            />
                        </Popover>
                    )}
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
                    <PreferencesButton classroom={classroomStore} />
                    {!windowsBtn?.showWindowsBtn && (
                        <TopBarRightBtn
                            icon={<SVGExit />}
                            title={t("exit")}
                            onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
                        />
                    )}
                    {windowsBtn?.showWindowsBtn && <TopBarDivider />}
                </>
            );
        }

        function renderRealtimePanel(): React.ReactNode {
            return (
                <RealtimePanel
                    chatSlot={
                        aiUser && <AIChatPanel aiUser={aiUser} classRoomStore={classroomStore} />
                    }
                    classroom={classroomStore}
                    isShow={isRealtimeSideOpen}
                    isVideoOn={classroomStore.isJoinedRTC}
                    videoSlot={
                        <div className="ai-page-rtc-avatar-container">
                            <RTCAvatar
                                avatarUser={classroomStore.users.creator}
                                chatSlot={
                                    (aiUser && classroomStore.userWindowsMode === "maximized" && (
                                        <AIChatPanel
                                            aiUser={aiUser}
                                            classRoomStore={classroomStore}
                                            show={show}
                                            uuid={classroomStore.rtcUID}
                                        />
                                    )) ||
                                    undefined
                                }
                                getPortal={classroomStore.getPortal}
                                isAI={true}
                                isAvatarUserCreator={true}
                                isCreator={classroomStore.isCreator}
                                isDropTarget={false}
                                rtcAvatar={
                                    classroomStore.users.creator &&
                                    classroomStore.rtc.getAvatar(
                                        classroomStore.users.creator.rtcUID,
                                    )
                                }
                                updateDeviceState={classroomStore.updateDeviceState}
                                userUUID={classroomStore.userUUID}
                            />
                            {aiUser && (
                                <RTCAIAvatar
                                    avatarUser={aiUser}
                                    chatSlot={
                                        (classroomStore.userWindowsMode === "maximized" && (
                                            <AIChatPanel
                                                aiUser={aiUser}
                                                cc={cc}
                                                classRoomStore={classroomStore}
                                                show={show}
                                                uuid={aiUser.userUUID}
                                            />
                                        )) ||
                                        undefined
                                    }
                                    getPortal={classroomStore.getPortal}
                                />
                            )}
                        </div>
                    }
                />
            );
        }
    }),
    true,
);

export default AIPage;
