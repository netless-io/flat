import type { PreferencesButtonProps } from "./index";

import React, { useCallback, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Checkbox, Select } from "antd";

import { useTranslate } from "@netless/flat-i18n";
import { IServiceVideoChatDevice } from "@netless/flat-services";
import { useSafePromise } from "flat-components";
import { PreferencesStoreContext } from "../StoreProvider";

export interface CameraSettingsProps extends PreferencesButtonProps {}

export const CameraSettings = observer<CameraSettingsProps>(function CameraSettings({ classroom }) {
    const t = useTranslate();
    const sp = useSafePromise();
    const preferences = useContext(PreferencesStoreContext);
    const { rtc } = classroom;
    const [current, setCurrent] = React.useState<string | null>(null);
    const [devices, setDevices] = React.useState<IServiceVideoChatDevice[]>([]);

    useEffect(() => {
        const updateCameraDevices = async (deviceID?: string): Promise<void> => {
            const devices = await sp(rtc.getCameraDevices());
            setDevices(devices);
            setCurrent(deviceID || devices[0]?.deviceId || null);
        };
        updateCameraDevices();
        return rtc.events.on("camera-changed", updateCameraDevices);
    }, [rtc, sp]);

    useEffect(() => {
        if (devices.length) {
            const current = rtc.getCameraID();
            if (current && devices.find(device => device.deviceId === current)) {
                setCurrent(current);
            } else {
                const first = devices[0].deviceId;
                preferences.updateCameraId(first);
                rtc.setCameraID(first);
            }
        }
    }, [rtc, devices, preferences]);

    const changeCamera = useCallback(
        (deviceId: string) => {
            preferences.updateCameraId(deviceId);
            rtc.setCameraID(deviceId);
            setCurrent(deviceId);
        },
        [preferences, rtc],
    );

    const toggleMirrorMode = useCallback(() => {
        const mirrorMode = !preferences.mirrorMode;
        preferences.updateMirrorMode(mirrorMode);
        rtc.setMirrorMode(mirrorMode);
    }, [preferences, rtc]);

    return (
        <div className="preferences-modal-section" id="preferences-1">
            <h3 className="preferences-modal-section-title">{t("camera-settings")}</h3>
            <Select
                className="preferences-modal-section-control"
                placeholder={t("default")}
                value={current}
                onChange={changeCamera}
            >
                {devices.map(device => (
                    <Select.Option key={device.deviceId} value={device.deviceId}>
                        {device.label}
                    </Select.Option>
                ))}
            </Select>
            <Checkbox
                checked={preferences.mirrorMode}
                className="preferences-modal-section-checkbox"
                onClick={toggleMirrorMode}
            >
                {t("mirror-mode")}
            </Checkbox>
        </div>
    );
});
