import "./style.less";
import cameraDisabledSVG from "../icons/camera-disabled.svg";

import React from "react";
import classNames from "classnames";
import { Device } from "../constants";
import { DeviceTestSelect } from "../DeviceTestSelect";
import { useTranslation } from "react-i18next";

export interface CameraTestProps {
    cameraDevices?: Device[];
    isCameraAccessible: boolean;
    currentCameraDeviceID: string;
    cameraVideoStreamRef: React.RefObject<HTMLDivElement>;
    setCameraDevice: (deviceID: string) => void;
}

export const CameraTest: React.FC<CameraTestProps> = ({
    cameraDevices,
    isCameraAccessible,
    currentCameraDeviceID,
    cameraVideoStreamRef,
    setCameraDevice,
}) => {
    const { t } = useTranslation();

    return (
        <div className="camera-test-container">
            <div className="camera-test-text">{t("camera")}</div>
            <div className="camera-test-select-box">
                <DeviceTestSelect
                    devices={cameraDevices}
                    isDeviceAccessible={isCameraAccessible}
                    currentDeviceID={currentCameraDeviceID}
                    onChange={setCameraDevice}
                />
            </div>
            <div className="camera-test-wrapper">
                <div className="camera-box" ref={cameraVideoStreamRef} />
                <div
                    className={classNames("camera-no-accredit-box", {
                        visible: !isCameraAccessible,
                    })}
                >
                    <img src={cameraDisabledSVG} />
                    <span>{t("enable-camera-permission-tip")}</span>
                </div>
            </div>
        </div>
    );
};
