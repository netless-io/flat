import playSVG from "../../../assets/image/play.svg";
import stopSVG from "../../../assets/image/stop.svg";
import muteSVG from "../../../assets/image/mute.svg";
import volumeSVG from "../../../assets/image/volume.svg";
import "./index.less";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Slider, Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import audioTestMP3 from "../../../assets/media/Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3";
import { DeviceSelect } from "../../../components/DeviceSelect";
import { Device } from "../../../types/device";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { runtime } from "../../../utils/runtime";
import { routeConfig } from "../../../route-config";
import { DeviceCheckResults } from "../utils";
import { useTranslation } from "react-i18next";
import path from "path";
import { FlatRTCContext } from "../../../components/FlatRTCContext";
import { useSafePromise } from "flat-components";

export const SpeakerCheckPage = (): React.ReactElement => {
    const { t } = useTranslation();
    const rtc = useContext(FlatRTCContext);
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
            rtc.startSpeakerTest(path.join(runtime.assetsPath, audioTestMP3));
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
                    <Button icon={<img src={isPlaying ? stopSVG : playSVG} />} onClick={togglePlay}>
                        BWV 988 - 05 - Variatio 4 a 1 Clav.mp3
                    </Button>
                </div>
                <div className="speaker-audio-check-container">
                    <p>{t("volume")}</p>
                    <div className="speaker-audio-check-inner">
                        <img src={muteSVG} />
                        <Slider
                            max={1}
                            min={0}
                            step={0.01}
                            value={currentVolume}
                            onChange={setCurrentVolume}
                        />
                        <img src={volumeSVG} />
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
};
