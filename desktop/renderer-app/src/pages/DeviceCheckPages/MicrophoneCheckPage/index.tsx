import infoSVG from "../../../assets/image/info.svg";
import successSVG from "../../../assets/image/success.svg";
import "./index.less";

import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { DeviceSelect } from "../../../components/DeviceSelect";
import { Device } from "../../../types/device";
import { useRTCEngine } from "../../../utils/hooks/use-rtc-engine";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { useHistory, useLocation } from "react-router-dom";
import { DeviceCheckResults, DeviceCheckState } from "../utils";
import { routeConfig } from "../../../route-config";
import { useTranslation } from "react-i18next";

interface SpeakerVolumeProps {
    percent: number;
}

const SpeakerVolume = observer<SpeakerVolumeProps>(function SpeakerVolume({ percent }) {
    return (
        <div className="speaker-audio-wrapper">
            <div className="speaker-audio-volume" style={{ width: `${percent}%` }} />
            <div className="speaker-audio-mask" />
        </div>
    );
});

export const MicrophoneCheckPage = (): React.ReactElement => {
    const { t } = useTranslation();
    const rtcEngine = useRTCEngine();
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const [currentVolume, setCurrentVolume] = useState(0);
    const [resultModalVisible, showResultModal] = useState(false);
    const [micCheckState, setMicCheckState] = useState<DeviceCheckState>();
    const location = useLocation<DeviceCheckResults | undefined>();
    const history = useHistory<DeviceCheckResults>();

    const { systemCheck, cameraCheck, speakerCheck } = location.state || {};

    const isSuccess =
        // also checked undefined
        systemCheck?.hasError === false &&
        cameraCheck?.hasError === false &&
        speakerCheck?.hasError === false &&
        micCheckState?.hasError === false;

    useEffect(() => {
        setDevices(rtcEngine.getAudioRecordingDevices() as Device[]);

        const onAudioDeviceStateChanged = (): void => {
            setDevices(rtcEngine.getVideoDevices() as Device[]);
        };

        rtcEngine.on("audioDeviceStateChanged", onAudioDeviceStateChanged);

        return () => {
            rtcEngine.off("audioDeviceStateChanged", onAudioDeviceStateChanged);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rtcEngine]);

    useEffect(() => {
        if (devices.length !== 0) {
            setCurrentDeviceID(devices[0].deviceid);
        }
    }, [devices]);

    useEffect(() => {
        const groupAudioVolumeIndication = (
            _speakers: any,
            _speakerNumber: any,
            totalVolume: number,
        ): void => {
            // totalVolume value max 255
            setCurrentVolume(Math.ceil((totalVolume / 255) * 100));
        };

        if (currentDeviceID) {
            rtcEngine.setAudioRecordingDevice(currentDeviceID);
            rtcEngine.on("groupAudioVolumeIndication", groupAudioVolumeIndication);
            rtcEngine.startAudioRecordingDeviceTest(300);
        }

        return () => {
            rtcEngine.removeListener("groupAudioVolumeIndication", groupAudioVolumeIndication);
            rtcEngine.stopAudioRecordingDeviceTest();
        };
    }, [currentDeviceID, rtcEngine]);

    return (
        <DeviceCheckLayoutContainer>
            <div className="speaker-check-container">
                <p>{t("microphone")}</p>
                <DeviceSelect
                    devices={devices}
                    currentDeviceID={currentDeviceID}
                    onChange={setCurrentDeviceID}
                />
                <p>{t("audition-sound")}</p>
                <SpeakerVolume percent={currentVolume} />
                <div className="speaker-check-btn-container">
                    <Button
                        onClick={() => {
                            setMicCheckState({ hasError: true });
                            showResultModal(true);
                        }}
                    >
                        {t("unable-to-see")}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            setMicCheckState({ hasError: false });
                            showResultModal(true);
                        }}
                    >
                        {t("able-to-see")}
                    </Button>
                </div>
                <Modal
                    width={368}
                    className="check-result-modal"
                    visible={resultModalVisible}
                    destroyOnClose
                    title={renderTitle()}
                    footer={renderFooter()}
                    onOk={() => showResultModal(false)}
                    onCancel={() => showResultModal(false)}
                >
                    <div className="table">
                        <div className="left">{t("system-testing")}</div>{" "}
                        <div className="middle">{renderDescription("systemCheck")}</div>
                        <div className="right">{renderSummary("systemCheck")}</div>
                        <div className="left">{t("camera-testing")}</div>{" "}
                        <div className="middle">{renderDescription("cameraCheck")}</div>
                        <div className="right">{renderSummary("cameraCheck")}</div>
                        <div className="left">{t("headphone-testing")}</div>{" "}
                        <div className="middle">{renderDescription("speakerCheck")}</div>
                        <div className="right">{renderSummary("speakerCheck")}</div>
                        <div className="left">{t("microphone-testing")}</div>{" "}
                        <div className="middle">{renderDescription("microphoneCheck")}</div>
                        <div className="right">{renderSummary("microphoneCheck")}</div>
                    </div>
                </Modal>
            </div>
        </DeviceCheckLayoutContainer>
    );

    function resetCheck(): void {
        history.push(routeConfig.SystemCheckPage.path);
    }

    function renderTitle(): React.ReactNode {
        if (isSuccess) {
            return (
                <div className="device-check-modal-title">
                    <img src={successSVG} alt="success" />
                    {t("device-condition-is-normal")}
                </div>
            );
        } else {
            return (
                <div className="device-check-modal-title">
                    <img src={infoSVG} alt="info" />
                    {t("device-condition-is-abnormal")}
                </div>
            );
        }
    }

    function renderFooter(): React.ReactNode {
        if (!isSuccess) {
            return (
                <Button type="primary" onClick={resetCheck} className="device-check-modal-btn">
                    {t("test-again")}
                </Button>
            );
        } else {
            return (
                <Button
                    type="primary"
                    onClick={() => showResultModal(false)}
                    className="device-check-modal-btn"
                >
                    {t("ok")}
                </Button>
            );
        }
    }

    function renderDescription(key: keyof DeviceCheckResults): React.ReactNode {
        const deviceCheckState: DeviceCheckState | undefined =
            key === "microphoneCheck" ? micCheckState : location.state?.[key];

        if (!deviceCheckState) {
            return <span className="red">{t("Untested")}</span>;
        }

        if (deviceCheckState.hasError) {
            return <span className="red">{deviceCheckState.content || t("testing-failed")}</span>;
        }

        return <span className="success">{deviceCheckState.content}</span>;
    }

    function renderSummary(key: keyof DeviceCheckResults): React.ReactNode {
        const deviceCheckState: DeviceCheckState | undefined =
            key === "microphoneCheck" ? micCheckState : location.state?.[key];

        if (!deviceCheckState || deviceCheckState.hasError) {
            return <span className="red">{t("abnormal")}</span>;
        }
        return <span className="green">{t("normal")}</span>;
    }
};
