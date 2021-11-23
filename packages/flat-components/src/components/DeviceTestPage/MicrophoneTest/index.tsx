import "./style.less";

import React from "react";
import { Device } from "../constants";
import { DeviceTestSelect } from "../DeviceTestSelect";
import { useTranslation } from "react-i18next";

export interface MicrophoneTestProps {
    microphoneDevices?: Device[];
    microphoneVolume: number;
    currentMicrophoneDeviceID: string;
    isMicrophoneAccessible: boolean;
    setMicrophoneDevice: (deviceID: string) => void;
}

export const MicrophoneTest: React.FC<MicrophoneTestProps> = ({
    microphoneDevices,
    microphoneVolume,
    isMicrophoneAccessible,
    currentMicrophoneDeviceID,
    setMicrophoneDevice,
}) => {
    const { t } = useTranslation();

    return (
        <div className="microphone-test-container">
            <div className="microphone-test-text">{t("microphone")}</div>
            <div className="microphone-text-select-box">
                <DeviceTestSelect
                    devices={microphoneDevices}
                    isDeviceAccessible={isMicrophoneAccessible}
                    currentDeviceID={currentMicrophoneDeviceID}
                    onChange={setMicrophoneDevice}
                />
            </div>
            <div className="microphone-test-wrapper">
                <div
                    className="microphone-test-volume"
                    style={{ width: `${microphoneVolume * 100}%` }}
                />
                <div className="microphone-test-mask" />
            </div>
        </div>
    );
};
