import React from "react";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { Device } from "../types/device";

export interface DeviceSelectProps {
    devices: Device[];
    currentDeviceID: string | null;
    onChange: (deviceID: string) => void;
}

export const DeviceSelect = observer<DeviceSelectProps>(function DeviceSelect({
    devices,
    currentDeviceID,
    onChange,
}) {
    if (currentDeviceID === null) {
        return <Select />;
    }

    return (
        <Select value={currentDeviceID} onChange={onChange}>
            {devices.map(({ deviceid, devicename }) => {
                return (
                    <Select.Option value={deviceid} key={deviceid}>
                        {devicename}
                    </Select.Option>
                );
            })}
        </Select>
    );
});
