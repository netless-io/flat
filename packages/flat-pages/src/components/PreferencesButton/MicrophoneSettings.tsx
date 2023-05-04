import type { PreferencesButtonProps } from "./index";

import React, { useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Select } from "antd";

import { useTranslate } from "@netless/flat-i18n";
import { IServiceVideoChatDevice } from "@netless/flat-services";
import { useSafePromise } from "flat-components";

export interface MicrophoneSettingsProps extends PreferencesButtonProps {}

export const MicrophoneSettings = observer<MicrophoneSettingsProps>(function MicrophoneSettings({
    classroom,
}) {
    const t = useTranslate();
    const sp = useSafePromise();
    const { rtc } = classroom;
    const [current, setCurrent] = React.useState<string | null>(null);
    const [devices, setDevices] = React.useState<IServiceVideoChatDevice[]>([]);

    useEffect(() => {
        const updateMicDevices = async (deviceID?: string): Promise<void> => {
            const devices = await sp(rtc.getMicDevices());
            setDevices(devices);
            setCurrent(deviceID || devices[0]?.deviceId || null);
        };
        updateMicDevices();
        return rtc.events.on("mic-changed", updateMicDevices);
    }, [rtc, sp]);

    useEffect(() => {
        if (devices.length) {
            const current = classroom.rtc.getMicID();
            if (current && devices.find(device => device.deviceId === current)) {
                setCurrent(current);
            } else {
                classroom.rtc.setMicID(devices[0].deviceId);
            }
        }
    }, [classroom.rtc, devices]);

    const changeMicrophone = useCallback(
        (deviceId: string) => {
            classroom.rtc.setMicID(deviceId);
            setCurrent(deviceId);
        },
        [classroom.rtc],
    );

    return (
        <div className="preferences-modal-section" id="preferences-3">
            <h3 className="preferences-modal-section-title">{t("microphone-settings")}</h3>
            <Select
                className="preferences-modal-section-control"
                value={current}
                onChange={changeMicrophone}
            >
                {devices.map(device => (
                    <Select.Option key={device.deviceId} value={device.deviceId}>
                        {device.label}
                    </Select.Option>
                ))}
            </Select>
        </div>
    );
});
