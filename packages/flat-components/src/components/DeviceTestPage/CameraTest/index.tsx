import "./style.less";
import cameraDisabledSVG from "../icons/camera-disabled.svg";

import React from "react";
import classNames from "classnames";
import { Device } from "../constants";
import { DeviceTestSelect } from "../DeviceTestSelect";
import { useTranslate } from "@netless/flat-i18n";

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
    const t = useTranslate();

    return (
        <div className="camera-test-container">
            <div className="camera-test-text">{t("camera")}</div>
            <div className="camera-test-select-box">
                <DeviceTestSelect
                    currentDeviceID={currentCameraDeviceID}
                    devices={cameraDevices}
                    isDeviceAccessible={isCameraAccessible}
                    onChange={setCameraDevice}
                />
            </div>
            <div className="camera-test-wrapper">
                <div ref={cameraVideoStreamRef} className="camera-box" />
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
