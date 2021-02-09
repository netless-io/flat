import React, { useEffect, useState } from "react";
import { Button } from "antd";
import "./MicrophoneTesting.less";
import type AgoraSDK from "agora-electron-sdk";
import { AGORA } from "../../constants/Process";
import { DeviceSelect } from "../../components/DeviceSelect";
import { Device } from "../../types/Device";
import { observer } from "mobx-react-lite";
import { TestingResult } from ".";

interface SpeakerVolumeProps {
    percent: number;
}

const SpeakerVolume = observer<SpeakerVolumeProps>(function SpeakerVolume({ percent }) {
    return (
        <div className="speaker-audio-wrapper">
            <div className="speaker-audio-volume" style={{ width: `${percent}%` }} />
            <div className="speaker-audio-mask" />
        </div>
    );
});

export interface MicrophoneTestingProps {
    onChange: (result: TestingResult) => void;
}

export const MicrophoneTesting = ({
    onChange: setMicrophone,
}: MicrophoneTestingProps): React.ReactElement => {
    const [rtcEngine] = useState<AgoraSDK>(() => new window.AgoraRtcEngine());
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const [currentVolume, setCurrentVolume] = useState(0);

    useEffect(() => {
        rtcEngine.initialize(AGORA.APP_ID);
        rtcEngine.on("error", e => {
            console.error("rtc error", e);
        });
        setDevices(rtcEngine.getAudioRecordingDevices() as Device[]);

        rtcEngine.on("audioDeviceStateChanged", () => {
            setDevices(rtcEngine.getVideoDevices() as Device[]);
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
        const groupAudioVolumeIndication = (
            _speakers: any,
            _speakerNumber: any,
            totalVolume: number,
        ): void => {
            // totalVolume value max 255
            setCurrentVolume(Math.ceil((totalVolume / 255) * 100));
        };

        if (currentDeviceID) {
            rtcEngine.setAudioRecordingDevice(currentDeviceID);
            rtcEngine.on("groupAudioVolumeIndication", groupAudioVolumeIndication);
            rtcEngine.startAudioRecordingDeviceTest(300);
        }

        return () => {
            rtcEngine.removeListener("groupAudioVolumeIndication", groupAudioVolumeIndication);
            rtcEngine.stopAudioRecordingDeviceTest();
        };
    }, [currentDeviceID, rtcEngine]);

    return (
        <div className="content-container">
            <div className="header-container">
                <span>麦克风检测</span>
            </div>
            <div className="speaker-testing-container">
                <p>麦克风</p>
                <DeviceSelect
                    devices={devices}
                    currentDeviceID={currentDeviceID}
                    onChange={setCurrentDeviceID}
                />
                <p>试听声音</p>
                <SpeakerVolume percent={currentVolume} />
                <div className="testing-btn">
                    <Button onClick={() => setMicrophone(TestingResult.Fail)}>不可以看到</Button>
                    <Button onClick={() => setMicrophone(TestingResult.Success)} type="primary">
                        可以看到
                    </Button>
                </div>
            </div>
        </div>
    );
};
