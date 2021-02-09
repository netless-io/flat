import React, { useEffect, useRef, useState } from "react";
import "./CameraTesting.less";
import { Button } from "antd";
import { useHistory } from "react-router-dom";
import type AgoraSdk from "agora-electron-sdk";
import { AGORA } from "../../constants/Process";
import { Device } from "../../types/Device";
import { DeviceSelect } from "../../components/DeviceSelect";
import { TestingResult } from ".";

export interface CameraTestingProps {
    onChange: (result: TestingResult) => void;
}

export const CameraTesting = ({ onChange: setCamera }: CameraTestingProps): React.ReactElement => {
    const [rtcEngine] = useState<AgoraSdk>(() => new window.AgoraRtcEngine());
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const cameraStream = useRef<HTMLDivElement>(null);
    const history = useHistory();

    useEffect(() => {
        setCamera(TestingResult.Undefined);
        rtcEngine.initialize(AGORA.APP_ID);
        rtcEngine.on("error", e => {
            console.error("rtc error", e);
        });
        setDevices(rtcEngine.getVideoDevices() as Device[]);

        rtcEngine.on("videoDeviceStateChanged", () => {
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
        if (currentDeviceID && cameraStream.current) {
            rtcEngine.setVideoDevice(currentDeviceID);
            // @ts-ignore agora type error
            rtcEngine.setVideoEncoderConfiguration({
                width: 320,
                height: 240,
            });
            rtcEngine.enableVideo();
            rtcEngine.setupLocalVideo(cameraStream.current);
            rtcEngine.startPreview();
        }

        return () => {
            rtcEngine.disableVideo();
            rtcEngine.stopPreview();
        };
    }, [currentDeviceID, cameraStream, rtcEngine]);

    return (
        <div className="content-container">
            <div className="header-container">
                <span>摄像头检测</span>
            </div>
            <div className="camera-container">
                <p>摄像头</p>
                <DeviceSelect
                    devices={devices}
                    currentDeviceID={currentDeviceID}
                    onChange={setCurrentDeviceID}
                />
                <div className="camera-info" ref={cameraStream} />
                <div className="testing-btn">
                    <Button onClick={fail}>不可以看到</Button>
                    <Button onClick={success} type="primary">
                        可以看到
                    </Button>
                </div>
            </div>
        </div>
    );

    function success(): void {
        setCamera(TestingResult.Success);
        history.push("/setting/speaker/");
    }

    function fail(): void {
        setCamera(TestingResult.Fail);
        history.push("/setting/speaker/");
    }
};
