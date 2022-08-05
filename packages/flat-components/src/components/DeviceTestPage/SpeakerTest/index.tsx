import playSVG from "../icons/play.svg";
import stopSVG from "../icons/stop.svg";
import "./style.less";

import { Button } from "antd";
import React, { useRef, useState } from "react";
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
}

export const SpeakerTest: React.FC<SpeakerTestProps> = ({
    speakerDevices,
    speakerTestFileName,
    currentSpeakerDeviceID,
    isSpeakerAccessible,
    audioResourceSrc,
    setSpeakerDevice,
}) => {
    const t = useTranslate();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = (): void => {
        isPlaying ? audioRef.current?.pause() : audioRef.current?.play();
        setIsPlaying(!isPlaying);
    };

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
                <audio
                    ref={audioRef}
                    loop
                    src={audioResourceSrc ? audioResourceSrc : audioLocalResourceMP3}
                ></audio>
                <Button icon={<img src={isPlaying ? stopSVG : playSVG} />} onClick={togglePlay}>
                    {speakerTestFileName}
                </Button>
            </div>
        </div>
    );
};
