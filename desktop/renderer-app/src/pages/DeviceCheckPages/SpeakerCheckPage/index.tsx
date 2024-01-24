import "./index.less";

import React, { useCallback, useEffect, useState } from "react";
import { Slider, Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import audioTestMP3 from "../../../assets/media/Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3";
import { DeviceSelect } from "../../../components/DeviceSelect";
import { Device } from "../../../types/device";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { runtime } from "../../../utils/runtime";
import { routeConfig } from "../../../route-config";
import { DeviceCheckResults } from "../utils";
import { useTranslate } from "@netless/flat-i18n";
import { SVGPause, SVGPlay, SVGSound, SVGSoundSilent, useSafePromise } from "flat-components";
import { withFlatServices } from "@netless/flat-pages/src/components/FlatServicesContext";

export const SpeakerCheckPage = withFlatServices("videoChat")(({
    videoChat: rtc,
}): React.ReactElement => {
    const t = useTranslate();
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const [currentVolume, setCurrentVolume] = useState(() => rtc.getSpeakerVolume());
    const [isPlaying, setIsPlaying] = useState(false);
    const history = useHistory<DeviceCheckResults>();
    const location = useLocation<DeviceCheckResults | undefined>();
    const sp = useSafePromise();

    const onDeviceIDChanged = useCallback(
        (deviceID: string): void => {
            console.log("set device", deviceID);
            rtc.setSpeakerID(deviceID);
        },
        [rtc],
    );

    useEffect(() => {
        const updateSpeakerDevices = async (deviceID?: string): Promise<void> => {
            const devices = await sp(rtc.getSpeakerDevices());
            setDevices(devices);
            setCurrentDeviceID(deviceID || devices[0]?.deviceId || null);
        };
        updateSpeakerDevices(rtc.getSpeakerID());
        return rtc.events.on("speaker-changed", updateSpeakerDevices);
    }, [rtc, sp]);

    useEffect(() => {
        if (currentDeviceID && isPlaying) {
            // Vite 3 returns a file url in production,
            // we need to convert it to an absolute path to feed it to rtc.
            if (audioTestMP3.startsWith("file://")) {
                rtc.startSpeakerTest(fileURLToPath(audioTestMP3));
            } else {
                rtc.startSpeakerTest(window.node.path.join(runtime.assetsPath, audioTestMP3));
            }
            return () => {
                rtc.stopSpeakerTest();
            };
        }
        return;
    }, [currentDeviceID, isPlaying, rtc, sp]);

    useEffect(() => {
        rtc.setSpeakerVolume(currentVolume);
    }, [currentVolume, rtc]);

    const togglePlay = (): void => {
        setIsPlaying(!isPlaying);
    };

    return (
        <DeviceCheckLayoutContainer>
            <div className="speaker-check-container">
                <div className="speaker-check-inner">
                    <p>{t("headphone")}</p>
                    <DeviceSelect
                        currentDeviceID={currentDeviceID}
                        devices={devices}
                        onChange={onDeviceIDChanged}
                    />
                    <p>{t("audition-sound")}</p>
                    <Button icon={isPlaying ? <SVGPause /> : <SVGPlay />} onClick={togglePlay}>
                        BWV 988 - 05 - Variatio 4 a 1 Clav.mp3
                    </Button>
                </div>
                <div className="speaker-audio-check-container">
                    <p>{t("volume")}</p>
                    <div className="speaker-audio-check-inner">
                        <SVGSoundSilent />
                        <Slider
                            max={1}
                            min={0}
                            step={0.01}
                            value={currentVolume}
                            onChange={setCurrentVolume}
                        />
                        <SVGSound />
                    </div>
                </div>
                <div className="speaker-btn-container">
                    <Button onClick={checkFail}>{t("unable-to-hear")}</Button>
                    <Button type="primary" onClick={checkSuccess}>
                        {t("able-to-hear")}
                    </Button>
                </div>
            </div>
        </DeviceCheckLayoutContainer>
    );

    function checkSuccess(): void {
        history.push({
            pathname: routeConfig.MicrophoneCheckPage.path,
            state: {
                ...location.state,
                speakerCheck: { content: "", hasError: false },
            },
        });
    }

    function checkFail(): void {
        history.push({
            pathname: routeConfig.MicrophoneCheckPage.path,
            state: {
                ...location.state,
                speakerCheck: { content: "", hasError: true },
            },
        });
    }
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
