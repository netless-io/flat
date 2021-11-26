import "./style.less";

import { Button, Checkbox } from "antd";
import React from "react";
import { CameraTest } from "./CameraTest";
import { Device } from "./constants";
import { MicrophoneTest } from "./MicrophoneTest";
import { SpeakerTest } from "./SpeakerTest";
import { useTranslation } from "react-i18next";

export type { Device };

export interface DeviceTestPanelProps {
    cameraDevices?: Device[];
    speakerDevices?: Device[];
    microphoneDevices?: Device[];
    audioResourceSrc?: string;
    speakerTestFileName: string;
    currentCameraDeviceID: string;
    currentSpeakerDeviceID: string;
    currentMicrophoneDeviceID: string;
    microphoneVolume: number;
    isCameraAccessible: boolean;
    isSpeakerAccessible: boolean;
    isMicrophoneAccessible: boolean;
    cameraVideoStreamRef: React.RefObject<HTMLDivElement>;
    setSpeakerDevice: (deviceID: string) => void;
    setCameraDevice: (deviceID: string) => void;
    setMicrophoneDevice: (deviceID: string) => void;
    toggleDeviceTest: () => void;
    joinRoom: () => void;
}

export const DeviceTestPanel: React.FC<DeviceTestPanelProps> = ({
    cameraDevices,
    speakerDevices,
    microphoneDevices,
    audioResourceSrc,
    speakerTestFileName,
    currentCameraDeviceID,
    currentSpeakerDeviceID,
    currentMicrophoneDeviceID,
    microphoneVolume,
    isCameraAccessible,
    isSpeakerAccessible,
    isMicrophoneAccessible,
    cameraVideoStreamRef,
    setCameraDevice,
    setMicrophoneDevice,
    setSpeakerDevice,
    toggleDeviceTest,
    joinRoom,
}) => {
    const { t } = useTranslation();
    return (
        <div className="device-test-panel-container">
            <div className="device-test-panel-title-box">{t("device-test")}</div>
            <div className="device-test-panel-inner-box">
                <div className="device-test-panel-inner-left">
                    <CameraTest
                        cameraDevices={cameraDevices}
                        isCameraAccessible={isCameraAccessible}
                        cameraVideoStreamRef={cameraVideoStreamRef}
                        currentCameraDeviceID={currentCameraDeviceID}
                        setCameraDevice={setCameraDevice}
                    />
                </div>
                <div className="device-test-panel-inner-right">
                    <SpeakerTest
                        speakerDevices={speakerDevices}
                        speakerTestFileName={speakerTestFileName}
                        isSpeakerAccessible={isSpeakerAccessible}
                        currentSpeakerDeviceID={currentSpeakerDeviceID}
                        audioResourceSrc={audioResourceSrc}
                        setSpeakerDevice={setSpeakerDevice}
                    />
                    <MicrophoneTest
                        microphoneDevices={microphoneDevices}
                        isMicrophoneAccessible={isMicrophoneAccessible}
                        microphoneVolume={microphoneVolume}
                        currentMicrophoneDeviceID={currentMicrophoneDeviceID}
                        setMicrophoneDevice={setMicrophoneDevice}
                    />
                </div>
            </div>
            <div className="device-test-panel-tips-box">
                <div className="device-test-panel-tips-radio">
                    <Checkbox onClick={toggleDeviceTest}>{t("close-tip")}</Checkbox>
                </div>
                <div className="device-test-panel-join-btn">
                    <Button type="primary" onClick={joinRoom}>
                        {t("join-room")}
                    </Button>
                </div>
            </div>
        </div>
    );
};
