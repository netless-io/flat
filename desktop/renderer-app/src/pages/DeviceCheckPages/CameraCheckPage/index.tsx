import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { DeviceSelect } from "../../../components/DeviceSelect";
import { routeConfig } from "../../../route-config";
import { Device } from "../../../types/device";
import { useRTCEngine } from "../../../utils/hooks/use-rtc-engine";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { DeviceCheckResults } from "../utils";
import "./index.less";

export const CameraCheckPage = (): React.ReactElement => {
    const { t } = useTranslation();
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
                <p>{t("camera")}</p>
                <DeviceSelect
                    currentDeviceID={currentDeviceID}
                    devices={devices}
                    onChange={setCurrentDeviceID}
                />
                <div ref={cameraStream} className="camera-check-info" />
                <div className="camera-check-btn">
                    <Button onClick={checkFail}>{t("unable-to-see")}</Button>
                    <Button type="primary" onClick={checkSuccess}>
                        {t("able-to-see")}
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
