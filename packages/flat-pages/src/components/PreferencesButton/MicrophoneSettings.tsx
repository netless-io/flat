import type { PreferencesButtonProps } from "./index";

import React, { useCallback, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Select } from "antd";

import { useTranslate } from "@netless/flat-i18n";
import { IServiceVideoChatDevice } from "@netless/flat-services";
import { useSafePromise } from "flat-components";
import { PreferencesStoreContext } from "../StoreProvider";

export interface MicrophoneSettingsProps extends PreferencesButtonProps {}

export const MicrophoneSettings = observer<MicrophoneSettingsProps>(function MicrophoneSettings({
    classroom,
}) {
    const t = useTranslate();
    const sp = useSafePromise();
    const preferences = useContext(PreferencesStoreContext);
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
            const current = rtc.getMicID();
            if (current && devices.find(device => device.deviceId === current)) {
                setCurrent(current);
            } else {
                const first = devices[0].deviceId;
                preferences.updateMicrophoneId(first);
                rtc.setMicID(first);
            }
        }
    }, [rtc, devices, preferences]);

    const changeMicrophone = useCallback(
        (deviceId: string) => {
            preferences.updateMicrophoneId(deviceId);
            rtc.setMicID(deviceId);
            setCurrent(deviceId);
        },
        [preferences, rtc],
    );

    return (
        <div className="preferences-modal-section" id="preferences-3">
            <h3 className="preferences-modal-section-title">{t("microphone-settings")}</h3>
            <Select
                className="preferences-modal-section-control"
                placeholder={t("default")}
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
