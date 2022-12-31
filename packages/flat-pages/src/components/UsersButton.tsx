import "./UsersButton.less";

// TODO: remove this component when multi sub window is done
import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { ClassroomStore } from "@netless/flat-stores";
import { SVGUserGroup, TopBarRightBtn, useComputed, UsersPanel } from "flat-components";

interface UsersButtonProps {
    classroom: ClassroomStore;
}

export const UsersButton = observer<UsersButtonProps>(function UsersButton({ classroom }) {
    const t = useTranslate();
    const [open, setOpen] = useState(false);

    const users = useComputed(() => {
        const { creator, speakingJoiners, handRaisingJoiners, otherJoiners } = classroom.users;
        return creator
            ? [...speakingJoiners, ...handRaisingJoiners, creator, ...otherJoiners]
            : [...speakingJoiners, ...handRaisingJoiners, ...otherJoiners];
    }).get();

    const getDeviceState = useCallback(
        (userUUID: string): { camera: boolean; mic: boolean } => {
            return classroom.deviceStateStorage?.state[userUUID] ?? { camera: false, mic: false };
        },
        [classroom.deviceStateStorage],
    );

    const getVolumeLevel = useCallback(
        (userUUID: string): number => {
            const uid = classroom.users.cachedUsers.get(userUUID)?.rtcUID;
            return classroom.rtc.getVolumeLevel(uid);
        },
        [classroom.rtc, classroom.users.cachedUsers],
    );

    useEffect(() => {
        if (classroom.isRequestingCamera) {
            const handle = Modal.confirm({
                content: t("teacher-request-camera"),
                onOk() {
                    const { mic } = getDeviceState(classroom.userUUID);
                    classroom.updateDeviceState(classroom.userUUID, true, mic);
                    classroom.toggleRequestingDevice(false, undefined);
                    classroom.replyRequestingDevice("camera", true);
                },
                onCancel() {
                    classroom.toggleRequestingDevice(false, undefined);
                    classroom.replyRequestingDevice("camera", false);
                },
            });
            return () => handle.destroy();
        }
        return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, classroom.isRequestingCamera, getDeviceState]);

    useEffect(() => {
        if (classroom.isRequestingMic) {
            const handle = Modal.confirm({
                content: t("teacher-request-mic"),
                onOk() {
                    const { camera } = getDeviceState(classroom.userUUID);
                    classroom.updateDeviceState(classroom.userUUID, camera, true);
                    classroom.toggleRequestingDevice(undefined, false);
                    classroom.replyRequestingDevice("mic", true);
                },
                onCancel() {
                    classroom.toggleRequestingDevice(undefined, false);
                    classroom.replyRequestingDevice("mic", false);
                },
            });
            return () => handle.destroy();
        }
        return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, classroom.isRequestingMic, getDeviceState]);

    const hasRaisingHand = !!classroom.classroomStorage?.state.raiseHandUsers.length;

    return (
        <>
            <TopBarRightBtn
                icon={<SVGUserGroup active={classroom.isCreator && hasRaisingHand} />}
                title={t("users")}
                onClick={() => setOpen(!open)}
            />
            <Modal
                centered
                destroyOnClose
                className="users-button-modal"
                footer={[]}
                open={open}
                title={t("users")}
                onCancel={() => setOpen(false)}
            >
                <UsersPanel
                    getDeviceState={getDeviceState}
                    getVolumeLevel={getVolumeLevel}
                    ownerUUID={classroom.ownerUUID}
                    userUUID={classroom.userUUID}
                    users={users}
                    onDeviceState={classroom.updateDeviceState}
                    onMuteAll={classroom.muteAll}
                    onOffStageAll={classroom.offStageAll}
                    onStaging={classroom.onStaging}
                    onWhiteboard={classroom.authorizeWhiteboard}
                />
            </Modal>
        </>
    );
});
