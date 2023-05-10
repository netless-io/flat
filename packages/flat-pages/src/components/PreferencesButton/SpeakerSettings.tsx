import type { PreferencesButtonProps } from "./index";

import speakerTestMP3 from "flat-components/components/DeviceTestPage/SpeakerTest/assets/media/Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Select } from "antd";

import { useTranslate } from "@netless/flat-i18n";
import { IServiceVideoChatDevice } from "@netless/flat-services";
import { SVGPause, SVGPlay, useSafePromise } from "flat-components";
import { PreferencesStoreContext, RuntimeContext } from "../StoreProvider";

export interface SpeakerSettingsProps extends PreferencesButtonProps {}

export const SpeakerSettings = observer<SpeakerSettingsProps>(function SpeakerSettings({
    classroom,
}) {
    const t = useTranslate();
    const sp = useSafePromise();
    const runtime = useContext(RuntimeContext);
    const preferences = useContext(PreferencesStoreContext);
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
            const current = rtc.getSpeakerID();
            if (current && devices.find(device => device.deviceId === current)) {
                setCurrent(current);
            } else {
                const first = devices[0].deviceId;
                preferences.updateSpeakerId(first);
                rtc.setSpeakerID(first);
            }
        }
    }, [rtc, devices, preferences]);

    const changeSpeaker = useCallback(
        (value: string): void => {
            preferences.updateSpeakerId(value);
            rtc.setSpeakerID(value);
            setCurrent(value);
        },
        [preferences, rtc],
    );

    const [isPlaying, setPlaying] = useState(false);
    const togglePlay = useCallback(() => setPlaying(playing => !playing), []);

    useEffect(() => {
        if (isPlaying) {
            let url = speakerTestMP3;
            if (window.isElectron) {
                if (url.startsWith("/@fs")) {
                    // vite dev mode returns a url like /@fs/path/to/file
                    url = url.slice(4);
                } else if (url.startsWith("file://")) {
                    // vite returns a file:// url in production
                    url = fileURLToPath(url);
                } else if (window.node && runtime && runtime.assetsPath) {
                    // other relative paths can be resolved with path.join()
                    window.node.path.join(runtime.assetsPath, url);
                }
            }
            console.log(url);
            classroom.rtc.startSpeakerTest(url);
            return () => classroom.rtc.stopSpeakerTest();
        }
        return;
    }, [classroom.rtc, isPlaying, runtime]);

    return (
        <div className="preferences-modal-section" id="preferences-2">
            <h3 className="preferences-modal-section-title">{t("speaker-settings")}</h3>
            <Select
                className="preferences-modal-section-control"
                placeholder={t("default")}
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

// Note: electron does not have url.fileURLToPath internally for 'safety'
// See https://www.electronjs.org/de/docs/latest/tutorial/sandbox#preload-scripts
// So we have to implement our own.
function fileURLToPath(url: string): string {
    let pathname = new URL(url).pathname;
    // if starts with a windows driver letter like "/C:/", strip the first slash
    if (/^\/\w:\//.test(pathname)) {
        pathname = pathname.slice(1);
    }
    return decodeURIComponent(pathname);
}
