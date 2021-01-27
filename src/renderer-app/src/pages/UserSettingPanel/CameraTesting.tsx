import React, { useEffect, useRef, useState } from "react";
import "./CameraTesting.less";
import { Button } from "antd";
import { Link } from "react-router-dom";
import type AgoraSdk from "agora-electron-sdk";
import { AGORA } from "../../constants/Process";
import { Device } from "../../types/Device";
import { DeviceSelect } from "../../components/DeviceSelect";

export const CameraTesting = (): React.ReactElement => {
    const [rtcEngine] = useState<AgoraSdk>(() => new window.AgoraRtcEngine());
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const cameraStream = useRef<HTMLDivElement>(null);

    useEffect(() => {
        rtcEngine.initialize(AGORA.APP_ID);
        setDevices(rtcEngine.getVideoDevices() as Device[]);

        rtcEngine.on("videoDeviceStateChanged", () => {
            setDevices(rtcEngine.getVideoDevices() as Device[]);
        });

        return () => {
            rtcEngine.removeAllListeners();
            rtcEngine.release();
        };
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
                    <Button>不可以看到</Button>
                    <Button type="primary">
                        <Link to="/setting/speaker/">可以看到</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
