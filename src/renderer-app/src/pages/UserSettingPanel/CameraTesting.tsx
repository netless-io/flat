import React, { useEffect, useRef, useState } from "react";
import "./CameraTesting.less";
import { Select, Button } from "antd";
import { Link } from "react-router-dom";
import type AgoraSdk from "agora-electron-sdk";
import { AGORA } from "../../constants/Process";

export const CameraTesting = (): React.ReactElement => {
    const [rtcEngine] = useState<AgoraSdk>(() => new window.AgoraRtcEngine());
    const [cameraDevices, setCameraDevices] = useState<Device[]>([]);
    const [currentCamera, setCurrentCamera] = useState<string | null>(null);
    const cameraStream = useRef<HTMLDivElement>(null);

    useEffect(() => {
        rtcEngine.initialize(AGORA.APP_ID);
        setCameraDevices(rtcEngine.getVideoDevices() as Device[]);

        rtcEngine.on("videoDeviceStateChanged", () => {
            setCameraDevices(rtcEngine.getVideoDevices() as Device[]);
        });

        return () => {
            rtcEngine.removeAllListeners();
            rtcEngine.release();
        };
    }, [rtcEngine]);

    useEffect(() => {
        if (cameraDevices.length !== 0) {
            setCurrentCamera(cameraDevices[0].deviceid);
        }
    }, [cameraDevices]);

    useEffect(() => {
        if (currentCamera && cameraStream.current) {
            rtcEngine.setVideoDevice(currentCamera);
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
    }, [currentCamera, cameraStream, rtcEngine]);

    const deviceSelect = (): React.ReactElement => {
        if (currentCamera === null) {
            return <></>;
        }

        return (
            <Select defaultValue={currentCamera} onChange={setCurrentCamera}>
                {cameraDevices.map(camera => {
                    return (
                        <Select.Option value={camera.deviceid} key={camera.deviceid}>
                            {camera.devicename}
                        </Select.Option>
                    );
                })}
                ;
            </Select>
        );
    };

    return (
        <div className="content-container">
            <div className="header-container">
                <span>摄像头检测</span>
            </div>
            <div className="camera-container">
                <p>摄像头</p>
                {deviceSelect()}
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

interface Device {
    devicename: string;
    deviceid: string;
}
