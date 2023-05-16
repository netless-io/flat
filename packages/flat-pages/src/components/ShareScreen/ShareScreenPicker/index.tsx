import "./style.less";

import classNames from "classnames";
import React, { useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal, Spin, Checkbox, Row, Col, Select } from "antd";

import { useTranslate } from "@netless/flat-i18n";
import { ClassroomStore } from "@netless/flat-stores";
import { IServiceVideoChatDevice } from "@netless/flat-services";
import { useSafePromise } from "flat-components";
import { ScreenList } from "./ScreenList";
import { RuntimeContext } from "../../StoreProvider";

interface ShareScreenPickerProps {
    classroomStore: ClassroomStore;
    handleOk: () => void;
}

const ShareScreenPickerModel = observer<ShareScreenPickerProps>(function ShareScreen({
    classroomStore,
    handleOk,
}) {
    const t = useTranslate();
    const runtime = useContext(RuntimeContext);

    useLayoutEffect(() => {
        classroomStore.refreshShareScreenInfo();
    }, [classroomStore]);

    const closeModal = useCallback(() => {
        classroomStore.toggleShareScreenPicker(false);
    }, [classroomStore]);

    const isSelected = classroomStore.selectedScreenInfo !== null;

    return (
        <div>
            <Modal
                centered
                open
                bodyStyle={{
                    padding: "16px 0 0 16px",
                }}
                className="share-screen-picker-model"
                footer={
                    <Row>
                        <Col flex={1} style={{ textAlign: "left" }}>
                            {runtime?.isMac ? null : (
                                <>
                                    <Checkbox
                                        checked={classroomStore.shareScreenWithAudio}
                                        onChange={ev =>
                                            classroomStore.toggleShareScreenWithAudio(
                                                ev.target.checked,
                                            )
                                        }
                                    >
                                        {t("share-screen.with-audio")}
                                    </Checkbox>
                                    {classroomStore.shareScreenWithAudio && (
                                        <ShareScreenSelectSpeaker classroom={classroomStore} />
                                    )}
                                </>
                            )}
                        </Col>
                        <Col>
                            <Button key="cancel" className="footer-button" onClick={closeModal}>
                                {t("cancel")}
                            </Button>
                            <ConfirmButton
                                key="confirm"
                                handleOk={handleOk}
                                isSelected={isSelected}
                            />
                        </Col>
                    </Row>
                }
                title={t("share-screen.choose-share-content")}
                width="784px"
                onCancel={closeModal}
            >
                <div
                    className={classNames("share-screen-picker", {
                        loading: classroomStore.shareScreenInfo.length === 0,
                    })}
                >
                    {classroomStore.shareScreenInfo.length > 0 ? (
                        <ScreenList
                            classroomStore={classroomStore}
                            screenInfo={classroomStore.shareScreenInfo}
                        />
                    ) : (
                        <Spin size="large" />
                    )}
                </div>
            </Modal>
        </div>
    );
});

export const ShareScreenPicker = observer<ShareScreenPickerProps>(function ShareScreen({
    classroomStore: classRoomStore,
    handleOk,
}) {
    return classRoomStore.shareScreenPickerVisible ? (
        <ShareScreenPickerModel classroomStore={classRoomStore} handleOk={handleOk} />
    ) : null;
});

interface ShareScreenSelectSpeakerProps {
    classroom: ClassroomStore;
}

const ShareScreenSelectSpeaker = observer<ShareScreenSelectSpeakerProps>(
    function ShareScreenSelectSpeaker({ classroom }) {
        const sp = useSafePromise();
        const [deviceId, setDeviceId] = useState<string>("");
        const [devices, setDevices] = useState<IServiceVideoChatDevice[]>([]);

        useEffect(() => {
            sp(classroom.rtc.getSpeakerDevices()).then(setDevices);
        }, [classroom.rtc, sp]);

        useEffect(() => {
            if (devices.length > 0 && !devices.some(e => e.deviceId === deviceId)) {
                setDeviceId(
                    devices.find(e => e.label.toLowerCase().includes("soundflower"))?.deviceId ??
                        devices[0].deviceId,
                );
            }
        }, [deviceId, devices]);

        useEffect(() => {
            const device = devices.find(e => e.deviceId === deviceId);
            classroom.setShareScreenAudioDevice(device ? device.label : "");
        }, [classroom, deviceId, devices]);

        return (
            <Select style={{ width: 180 }} value={deviceId} onChange={setDeviceId}>
                {devices.map(({ deviceId, label }) => (
                    <Select.Option key={deviceId} value={deviceId}>
                        {label}
                    </Select.Option>
                ))}
            </Select>
        );
    },
);

interface ConfirmButtonProps {
    isSelected: boolean;
    handleOk: () => void;
}

const ConfirmButton = observer<ConfirmButtonProps>(function ConfirmButton({
    isSelected,
    handleOk,
}) {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const t = useTranslate();

    return (
        <Button
            key="submit"
            className="footer-button"
            disabled={!isSelected}
            loading={confirmLoading}
            type="primary"
            onClick={() => {
                setConfirmLoading(true);
                handleOk();
            }}
        >
            {t("confirm")}
        </Button>
    );
});
