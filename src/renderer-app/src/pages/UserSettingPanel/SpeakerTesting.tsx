import React, { useEffect, useState } from "react";
import { Slider, Button } from "antd";
import "./SpeakerTesting.less";
import { useHistory } from "react-router-dom";
// let webpack recognize
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _testMP3 from "../../assets/media/Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3";
import playSVG from "../../assets/image/play.svg";
import stopSVG from "../../assets/image/stop.svg";
import { Device } from "../../types/Device";
import { AGORA } from "../../constants/Process";
import { DeviceSelect } from "../../components/DeviceSelect";
import { runtime } from "../../utils/runtime";
import { TestingResult } from ".";

export interface SpeakerTestingProps {
    onChange: (result: TestingResult) => void;
}

export const SpeakerTesting = ({
    onChange: setSpeaker,
}: SpeakerTestingProps): React.ReactElement => {
    const [rtcEngine] = useState(() => new window.AgoraRtcEngine());
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const [currentVolume, setCurrentVolume] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const history = useHistory();

    useEffect(() => {
        setSpeaker(TestingResult.Undefined);
        rtcEngine.initialize(AGORA.APP_ID);
        rtcEngine.on("error", (e: any) => console.error("rtc error", e));
        setDevices(rtcEngine.getAudioPlaybackDevices() as Device[]);

        rtcEngine.on("audioDeviceStateChanged", () => {
            setDevices(rtcEngine.getAudioPlaybackDevices() as Device[]);
        });

        return () => {
            rtcEngine.removeAllListeners();
            rtcEngine.release();
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
                `${runtime.assetsPath}/media/Goldberg Variations, BWV 988 - 05 - Variatio 4 a 1 Clav.mp3`,
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
        <div className="content-container">
            <div className="header-container">
                <span>扬声器检测</span>
            </div>
            <div className="speaker-testing-container">
                <div className="speaker-container">
                    <p>扬声器</p>
                    <DeviceSelect
                        devices={devices}
                        currentDeviceID={currentDeviceID}
                        onChange={setCurrentDeviceID}
                    />
                    <p>试听声音</p>
                    <Button icon={<img src={isPlaying ? stopSVG : playSVG} />} onClick={togglePlay}>
                        BWV 988 - 05 - Variatio 4 a 1 Clav.mp3
                    </Button>
                </div>
                <div className="speaker-audio-testing">
                    <p>音量</p>
                    <Slider value={currentVolume} onChange={setCurrentVolume} />
                </div>
                <div className="testing-btn">
                    <Button onClick={fail}>不可以听到</Button>
                    <Button onClick={success} type="primary">
                        可以听到
                    </Button>
                </div>
            </div>
        </div>
    );

    function success(): void {
        setSpeaker(TestingResult.Success);
        history.push("/setting/microphone/");
    }

    function fail(): void {
        setSpeaker(TestingResult.Fail);
        history.push("/setting/microphone/");
    }
};
