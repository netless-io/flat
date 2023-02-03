import playSVG from "../icons/play.svg";
import stopSVG from "../icons/stop.svg";
import "./style.less";

import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { Device } from "../constants";
import { DeviceTestSelect } from "../DeviceTestSelect";
import { useTranslate } from "@netless/flat-i18n";
import audioLocalResourceMP3 from "./assets/media/Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3";

export interface SpeakerTestProps {
    speakerDevices?: Device[];
    speakerTestFileName: string;
    currentSpeakerDeviceID: string;
    isSpeakerAccessible: boolean;
    audioResourceSrc?: string;
    setSpeakerDevice: (deviceID: string) => void;
    startSpeakerTest: (url: string) => void;
    stopSpeakerTest: () => void;
}

export const SpeakerTest: React.FC<SpeakerTestProps> = ({
    speakerDevices,
    speakerTestFileName,
    currentSpeakerDeviceID,
    isSpeakerAccessible,
    audioResourceSrc,
    setSpeakerDevice,
    startSpeakerTest,
    stopSpeakerTest,
}) => {
    const t = useTranslate();
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (): void => {
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (isPlaying) {
            startSpeakerTest(audioResourceSrc || audioLocalResourceMP3);
        } else {
            stopSpeakerTest();
        }
        return () => {
            stopSpeakerTest();
        };
    }, [audioResourceSrc, isPlaying, startSpeakerTest, stopSpeakerTest]);

    return (
        <div className="speaker-test-container">
            <div className="speaker-test-text">{t("speaker")}</div>
            <div className="speaker-text-select-box">
                <DeviceTestSelect
                    currentDeviceID={currentSpeakerDeviceID}
                    devices={speakerDevices}
                    isDeviceAccessible={isSpeakerAccessible}
                    onChange={setSpeakerDevice}
                />
            </div>
            <div className="speaker-test-output-box">
                <Button icon={<img src={isPlaying ? stopSVG : playSVG} />} onClick={togglePlay}>
                    {speakerTestFileName}
                </Button>
            </div>
        </div>
    );
};
