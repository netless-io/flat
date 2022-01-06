import playSVG from "../../../assets/image/play.svg";
import stopSVG from "../../../assets/image/stop.svg";
import muteSVG from "../../../assets/image/mute.svg";
import volumeSVG from "../../../assets/image/volume.svg";
import "./index.less";

import React, { useEffect, useState } from "react";
import { Slider, Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
// let webpack recognize
import "../../../assets/media/Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3";
import { DeviceSelect } from "../../../components/DeviceSelect";
import { Device } from "../../../types/device";
import { useRTCEngine } from "../../../utils/hooks/use-rtc-engine";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { runtime } from "../../../utils/runtime";
import { routeConfig } from "../../../route-config";
import { DeviceCheckResults } from "../utils";
import { useTranslation } from "react-i18next";
import path from "path";

export const SpeakerCheckPage = (): React.ReactElement => {
    const { t } = useTranslation();
    const rtcEngine = useRTCEngine();
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const [currentVolume, setCurrentVolume] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const history = useHistory<DeviceCheckResults>();
    const location = useLocation<DeviceCheckResults | undefined>();

    useEffect(() => {
        setDevices(rtcEngine.getAudioPlaybackDevices() as Device[]);

        const onAudioDeviceStateChanged = (): void => {
            setDevices(rtcEngine.getAudioPlaybackDevices() as Device[]);
        };

        rtcEngine.on("audioDeviceStateChanged", onAudioDeviceStateChanged);

        return () => {
            rtcEngine.off("audioDeviceStateChanged", onAudioDeviceStateChanged);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rtcEngine]);

    useEffect(() => {
        if (devices.length !== 0) {
            setCurrentDeviceID(devices[0].deviceid);
        }
    }, [devices]);

    useEffect(() => {
        if (currentDeviceID && isPlaying) {
            rtcEngine.setAudioPlaybackDevice(currentDeviceID);
            rtcEngine.startAudioPlaybackDeviceTest(
                path.join(
                    runtime.assetsPath,
                    "media",
                    "Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3",
                ),
            );
        }

        return () => {
            rtcEngine.stopAudioPlaybackDeviceTest();
        };
    }, [currentDeviceID, isPlaying, rtcEngine]);

    useEffect(() => {
        rtcEngine.setAudioPlaybackVolume(Math.ceil((currentVolume / 100) * 255));
    }, [currentVolume, currentDeviceID, rtcEngine]);

    const togglePlay = (): void => {
        setIsPlaying(!isPlaying);
    };

    return (
        <DeviceCheckLayoutContainer>
            <div className="speaker-check-container">
                <div className="speaker-check-inner">
                    <p>{t("headphone")}</p>
                    <DeviceSelect
                        devices={devices}
                        currentDeviceID={currentDeviceID}
                        onChange={setCurrentDeviceID}
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
                        <Slider value={currentVolume} onChange={setCurrentVolume} />
                        <img src={volumeSVG} />
                    </div>
                </div>
                <div className="speaker-btn-container">
                    <Button onClick={checkFail}>{t("unable-to-hear")}</Button>
                    <Button onClick={checkSuccess} type="primary">
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
