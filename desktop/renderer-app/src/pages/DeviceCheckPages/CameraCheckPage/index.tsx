import "./index.less";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { DeviceSelect } from "../../../components/DeviceSelect";
import { Device } from "../../../types/Device";
import { useRTCEngine } from "../../../utils/hooks/useRTCEngine";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { routeConfig } from "../../../route-config";
import { DeviceCheckResults } from "../utils";
export interface CameraCheckPageProps {}

export const CameraCheckPage = (): React.ReactElement => {
    const rtcEngine = useRTCEngine();
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const cameraStream = useRef<HTMLDivElement>(null);
    const history = useHistory<DeviceCheckResults>();
    const location = useLocation<DeviceCheckResults | undefined>();

    useEffect(() => {
        const onVideoDeviceStateChanged = (): void => {
            setDevices(rtcEngine.getVideoDevices() as Device[]);
        };

        setDevices(rtcEngine.getVideoDevices() as Device[]);

        rtcEngine.on("videoDeviceStateChanged", onVideoDeviceStateChanged);

        return () => {
            rtcEngine.off("videoDeviceStateChanged", onVideoDeviceStateChanged);
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
            rtcEngine.enableLocalVideo(true);
            rtcEngine.startPreview();
        }

        return () => {
            rtcEngine.disableVideo();
            rtcEngine.stopPreview();
        };
    }, [currentDeviceID, cameraStream, rtcEngine]);

    return (
        <DeviceCheckLayoutContainer>
            <div className="camera-check-container">
                <p>摄像头</p>
                <DeviceSelect
                    devices={devices}
                    currentDeviceID={currentDeviceID}
                    onChange={setCurrentDeviceID}
                />
                <div className="camera-check-info" ref={cameraStream} />
                <div className="camera-check-btn">
                    <Button onClick={checkFail}>不能看到</Button>
                    <Button onClick={checkSuccess} type="primary">
                        能看到
                    </Button>
                </div>
            </div>
        </DeviceCheckLayoutContainer>
    );

    function checkSuccess(): void {
        history.push({
            pathname: routeConfig.SpeakerCheckPage.path,
            state: {
                ...location.state,
                cameraCheck: { content: "", hasError: false },
            },
        });
    }

    function checkFail(): void {
        history.push({
            pathname: routeConfig.SpeakerCheckPage.path,
            state: {
                ...location.state,
                cameraCheck: { content: "", hasError: true },
            },
        });
    }
};
