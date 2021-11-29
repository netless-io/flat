import disabledSVG from "../icons/disabled.svg";
import "./style.less";

import React from "react";
import { Button, Select } from "antd";
import { Device } from "../constants";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    return (
        <div className="device-test-select-container">
            {isDeviceAccessible ? (
                <div className="device-test-select-box">
                    <Select value={currentDeviceID} onChange={onChange}>
                        {devices?.map(({ deviceId, label }) => {
                            return (
                                <Select.Option value={deviceId} key={deviceId}>
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
