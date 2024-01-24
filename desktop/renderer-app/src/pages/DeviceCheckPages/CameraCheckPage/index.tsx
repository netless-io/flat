import "./index.less";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { useSafePromise } from "flat-components";
import { DeviceSelect } from "../../../components/DeviceSelect";
import { Device } from "../../../types/device";
import { DeviceCheckLayoutContainer } from "../DeviceCheckLayoutContainer";
import { routeConfig } from "../../../route-config";
import { DeviceCheckResults } from "../utils";
import { useTranslate } from "@netless/flat-i18n";
import { withFlatServices } from "@netless/flat-pages/src/components/FlatServicesContext";

export const CameraCheckPage = withFlatServices("videoChat")(({
    videoChat: rtc,
}): React.ReactElement => {
    const t = useTranslate();
    const [devices, setDevices] = useState<Device[]>([]);
    const [currentDeviceID, setCurrentDeviceID] = useState<string | null>(null);
    const cameraStream = useRef<HTMLDivElement>(null);
    const history = useHistory<DeviceCheckResults>();
    const location = useLocation<DeviceCheckResults | undefined>();
    const sp = useSafePromise();

    const onCameraChanged = useCallback(
        (deviceID: string): void => {
            rtc.setCameraID(deviceID);
        },
        [rtc],
    );

    useEffect(() => {
        const updateCameraDevices = async (deviceID?: string): Promise<void> => {
            const devices = await sp(rtc.getCameraDevices());
            setDevices(devices);
            setCurrentDeviceID(deviceID || devices[0]?.deviceId || null);
        };
        updateCameraDevices();
        return rtc.events.on("camera-changed", updateCameraDevices);
    }, [rtc, sp]);

    useEffect(() => {
        if (currentDeviceID && cameraStream.current) {
            rtc.startCameraTest(cameraStream.current);
            return () => {
                rtc.stopCameraTest();
            };
        }
        return;
    }, [currentDeviceID, rtc]);

    return (
        <DeviceCheckLayoutContainer>
            <div className="camera-check-container">
                <p>{t("camera")}</p>
                <DeviceSelect
                    currentDeviceID={currentDeviceID}
                    devices={devices}
                    onChange={onCameraChanged}
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
});
