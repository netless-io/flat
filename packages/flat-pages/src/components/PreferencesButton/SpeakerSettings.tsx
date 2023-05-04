import type { PreferencesButtonProps } from "./index";

import speakerTestMP3 from "flat-components/components/DeviceTestPage/SpeakerTest/assets/media/Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3";

import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Select } from "antd";

import { useTranslate } from "@netless/flat-i18n";
import { IServiceVideoChatDevice } from "@netless/flat-services";
import { SVGPause, SVGPlay, useSafePromise } from "flat-components";

export interface SpeakerSettingsProps extends PreferencesButtonProps {}

export const SpeakerSettings = observer<SpeakerSettingsProps>(function SpeakerSettings({
    classroom,
}) {
    const t = useTranslate();
    const sp = useSafePromise();
    const { rtc } = classroom;
    const [current, setCurrent] = React.useState<string | null>(null);
    const [devices, setDevices] = React.useState<IServiceVideoChatDevice[]>([]);

    useEffect(() => {
        const updateSpeakerDevices = async (deviceID?: string): Promise<void> => {
            const devices = await sp(rtc.getSpeakerDevices());
            setDevices(devices);
            setCurrent(deviceID || devices[0]?.deviceId || null);
        };
        updateSpeakerDevices();
        return rtc.events.on("speaker-changed", updateSpeakerDevices);
    }, [rtc, sp]);

    useEffect(() => {
        if (devices.length) {
            const current = classroom.rtc.getSpeakerID();
            if (current && devices.find(device => device.deviceId === current)) {
                setCurrent(current);
            } else {
                classroom.rtc.setSpeakerID(devices[0].deviceId);
            }
        }
    }, [classroom.rtc, devices]);

    const changeSpeaker = useCallback(
        (value: string): void => {
            classroom.rtc.setSpeakerID(value);
            setCurrent(value);
        },
        [classroom.rtc],
    );

    const [isPlaying, setPlaying] = useState(false);
    const togglePlay = useCallback(() => setPlaying(playing => !playing), []);

    useEffect(() => {
        if (isPlaying) {
            classroom.rtc.startSpeakerTest(speakerTestMP3);
            return () => classroom.rtc.stopSpeakerTest();
        }
        return;
    }, [classroom.rtc, isPlaying]);

    return (
        <div className="preferences-modal-section" id="preferences-2">
            <h3 className="preferences-modal-section-title">{t("speaker-settings")}</h3>
            <Select
                className="preferences-modal-section-control"
                value={current}
                onChange={changeSpeaker}
            >
                {devices.map(device => (
                    <Select.Option key={device.deviceId} value={device.deviceId}>
                        {device.label}
                    </Select.Option>
                ))}
            </Select>
            <Button
                className="preferences-modal-section-button"
                icon={
                    isPlaying ? (
                        <SVGPause className="preferences-modal-section-button-icon-end" />
                    ) : (
                        <SVGPlay className="preferences-modal-section-button-icon-end" />
                    )
                }
                onClick={togglePlay}
            >
                Sound
            </Button>
        </div>
    );
});
