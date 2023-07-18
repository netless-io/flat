import "./style.less";

import { Button, Checkbox } from "antd";
import React from "react";
import { CameraTest } from "./CameraTest";
import { Device } from "./constants";
import { MicrophoneTest } from "./MicrophoneTest";
import { SpeakerTest } from "./SpeakerTest";
import { useTranslate } from "@netless/flat-i18n";

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
    isTurnOffDeviceTest: boolean;
    setSpeakerDevice: (deviceID: string) => void;
    setCameraDevice: (deviceID: string) => void;
    setMicrophoneDevice: (deviceID: string) => void;
    startSpeakerTest: (url: string) => void;
    stopSpeakerTest: () => void;
    toggleDeviceTest: () => void;
    joinRoom: () => void;
    autoMicOn: boolean;
    autoCameraOn: boolean;
    toggleAutoMicOn: () => void;
    toggleAutoCameraOn: () => void;
    mirrorMode: boolean;
    toggleMirrorMode: () => void;
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
    isTurnOffDeviceTest,
    setCameraDevice,
    setMicrophoneDevice,
    setSpeakerDevice,
    startSpeakerTest,
    stopSpeakerTest,
    toggleDeviceTest,
    joinRoom,
    autoMicOn,
    autoCameraOn,
    toggleAutoMicOn,
    toggleAutoCameraOn,
    mirrorMode,
    toggleMirrorMode,
}) => {
    const t = useTranslate();
    return (
        <div className="device-test-panel-container">
            <div className="device-test-panel-title-box">{t("device-test")}</div>
            <div className="device-test-panel-inner-box">
                <div className="device-test-panel-inner-left">
                    <CameraTest
                        cameraDevices={cameraDevices}
                        cameraVideoStreamRef={cameraVideoStreamRef}
                        currentCameraDeviceID={currentCameraDeviceID}
                        isCameraAccessible={isCameraAccessible}
                        setCameraDevice={setCameraDevice}
                    />
                </div>
                <div className="device-test-panel-inner-right">
                    <SpeakerTest
                        audioResourceSrc={audioResourceSrc}
                        currentSpeakerDeviceID={currentSpeakerDeviceID}
                        isSpeakerAccessible={isSpeakerAccessible}
                        setSpeakerDevice={setSpeakerDevice}
                        speakerDevices={speakerDevices}
                        speakerTestFileName={speakerTestFileName}
                        startSpeakerTest={startSpeakerTest}
                        stopSpeakerTest={stopSpeakerTest}
                    />
                    <MicrophoneTest
                        currentMicrophoneDeviceID={currentMicrophoneDeviceID}
                        isMicrophoneAccessible={isMicrophoneAccessible}
                        microphoneDevices={microphoneDevices}
                        microphoneVolume={microphoneVolume}
                        setMicrophoneDevice={setMicrophoneDevice}
                    />
                    <div className="device-test-panel-join-options">
                        <div className="device-test-panel-join-options-text">
                            {t("join-options")}
                        </div>
                        <Checkbox checked={autoMicOn} onClick={toggleAutoMicOn}>
                            {t("turn-on-the-microphone")}
                        </Checkbox>
                        <Checkbox checked={autoCameraOn} onClick={toggleAutoCameraOn}>
                            {t("turn-on-the-camera")}
                        </Checkbox>
                        <Checkbox checked={mirrorMode} onClick={toggleMirrorMode}>
                            {t("mirror")}
                        </Checkbox>
                    </div>
                </div>
            </div>
            <div className="device-test-panel-tips-box">
                <div className="device-test-panel-tips-radio">
                    <Checkbox checked={isTurnOffDeviceTest} onClick={toggleDeviceTest}>
                        {t("close-tip")}
                    </Checkbox>
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
