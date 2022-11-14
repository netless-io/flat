import disabledSVG from "../icons/disabled.svg";
import "./style.less";

import React from "react";
import { Button, Select } from "antd";
import { Device } from "../constants";
import { useTranslate } from "@netless/flat-i18n";

export interface DeviceTestSelectProps {
    devices?: Device[];
    isDeviceAccessible: boolean;
    currentDeviceID: string;
    onChange: (deviceID: string) => void;
}

export const DeviceTestSelect: React.FC<DeviceTestSelectProps> = ({
    devices,
    isDeviceAccessible,
    currentDeviceID,
    onChange,
}) => {
    const t = useTranslate();
    const deviceId = devices?.some(device => device.deviceId === currentDeviceID)
        ? currentDeviceID
        : undefined;

    return (
        <div className="device-test-select-container">
            {isDeviceAccessible ? (
                <div className="device-test-select-box">
                    <Select value={deviceId} onChange={onChange}>
                        {devices?.map(({ deviceId, label }) => {
                            return (
                                <Select.Option key={deviceId} value={deviceId}>
                                    {label}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </div>
            ) : (
                <div className="device-test-select-disabled-btn">
                    <Button icon={<img src={disabledSVG} />}>{t("no-device-permission")}</Button>
                </div>
            )}
        </div>
    );
};
