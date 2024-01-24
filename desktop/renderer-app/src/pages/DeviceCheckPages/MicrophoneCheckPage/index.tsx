import infoSVG from "../../../assets/image/info.svg";
import successSVG from "../../../assets/image/success.svg";
import "./index.less";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { DeviceSelect } from "../../../components/DeviceSelect";
import { Device } from "../../../types/device";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { useHistory, useLocation } from "react-router-dom";
import { DeviceCheckResults, DeviceCheckState } from "../utils";
import { routeConfig } from "../../../route-config";
import { useTranslate } from "@netless/flat-i18n";
import { useSafePromise } from "flat-components";
import { withFlatServices } from "@netless/flat-pages/src/components/FlatServicesContext";

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

export const MicrophoneCheckPage = withFlatServices("videoChat")(({
    videoChat: rtc,
}): React.ReactElement => {
    const t = useTranslate();
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const [currentVolume, setCurrentVolume] = useState(0);
    const [resultModalVisible, showResultModal] = useState(false);
    const [micCheckState, setMicCheckState] = useState<DeviceCheckState>();
    const location = useLocation<DeviceCheckResults | undefined>();
    const history = useHistory<DeviceCheckResults>();
    const sp = useSafePromise();

    const { systemCheck, cameraCheck, speakerCheck } = location.state || {};

    const isSuccess =
        // also checked undefined
        systemCheck?.hasError === false &&
        cameraCheck?.hasError === false &&
        speakerCheck?.hasError === false &&
        micCheckState?.hasError === false;

    const onMicChanged = useCallback(
        (deviceID: string): void => {
            rtc.setMicID(deviceID);
        },
        [rtc],
    );

    useEffect(() => {
        const updateMicDevices = async (deviceID?: string): Promise<void> => {
            const devices = await sp(rtc.getMicDevices());
            setDevices(devices);
            setCurrentDeviceID(deviceID || devices[0]?.deviceId || null);
        };
        updateMicDevices();
        return rtc.events.on("mic-changed", updateMicDevices);
    }, [rtc, sp]);

    useEffect(() => {
        return rtc.events.on("volume-level-changed", volume => {
            setCurrentVolume(volume * 100);
        });
    }, [currentDeviceID, rtc]);

    useEffect(() => {
        if (currentDeviceID) {
            rtc.startMicTest();
            return () => {
                rtc.stopMicTest();
            };
        }
        return;
    }, [currentDeviceID, rtc]);

    return (
        <DeviceCheckLayoutContainer>
            <div className="speaker-check-container">
                <p>{t("microphone")}</p>
                <DeviceSelect
                    currentDeviceID={currentDeviceID}
                    devices={devices}
                    onChange={onMicChanged}
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
                    destroyOnClose
                    className="check-result-modal"
                    footer={renderFooter()}
                    title={renderTitle()}
                    visible={resultModalVisible}
                    width={368}
                    onCancel={() => showResultModal(false)}
                    onOk={() => showResultModal(false)}
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
                    <img alt="success" src={successSVG} />
                    {t("device-condition-is-normal")}
                </div>
            );
        } else {
            return (
                <div className="device-check-modal-title">
                    <img alt="info" src={infoSVG} />
                    {t("device-condition-is-abnormal")}
                </div>
            );
        }
    }

    function renderFooter(): React.ReactNode {
        if (isSuccess) {
            return (
                <Button
                    className="device-check-modal-btn"
                    type="primary"
                    onClick={() => showResultModal(false)}
                >
                    {t("ok")}
                </Button>
            );
        } else {
            return (
                <Button className="device-check-modal-btn" type="primary" onClick={resetCheck}>
                    {t("test-again")}
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
});
