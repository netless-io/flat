import "./style.less";

import { DeviceTestPanel } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";

import { DeviceTest } from "../../api-middleware/rtc/device-test";
import { useParams } from "react-router-dom";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { joinRoomHandler } from "../utils/join-room-handler";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { configStore } from "../../stores/config-store";

export const DevicesTestPage = observer(function DeviceTestPage() {
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const { roomUUID } = useParams<RouteParams<RouteNameType.JoinPage>>();

    const cameraVideoStreamRef = useRef<HTMLDivElement>(null);

    const [deviceTest] = useState(() => new DeviceTest());

    const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
    const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);

    const [cameraDeviceId, setCameraDeviceId] = useState<string>("");
    const [microphoneDeviceId, setMicrophoneDeviceId] = useState<string>("");

    const [isCameraAccessible, setIsCameraAccessible] = useState(true);
    const [isMicrophoneAccessible, setIsMicrophoneAccessible] = useState(true);

    const [volume, setVolume] = useState(0);

    useEffect(() => {
        if (cameraDevices.length > 0 && !cameraDeviceId) {
            setCameraDeviceId(cameraDevices[0].deviceId);
        }
    }, [cameraDeviceId, cameraDevices]);

    useEffect(() => {
        if (microphoneDevices.length > 0 && !microphoneDeviceId) {
            setMicrophoneDeviceId(microphoneDevices[0].deviceId);
        }
    }, [microphoneDeviceId, microphoneDevices]);

    const setCameraElement = useCallback(
        (cameraElement: HTMLDivElement | null): void => {
            deviceTest.setCameraElement(cameraElement);
        },
        [deviceTest],
    );

    useEffect(() => {
        setCameraElement(cameraVideoStreamRef.current);
    }, [cameraVideoStreamRef, setCameraElement]);

    const onCameraDevicesChanged = useCallback((devices: MediaDeviceInfo[]) => {
        const cameraDevices: MediaDeviceInfo[] = [];
        for (const cameraDevice of devices) {
            if (!cameraDevice.deviceId) {
                continue;
            }
            cameraDevices.push(cameraDevice);
            setCameraDevices(cameraDevices);
            setIsCameraAccessible(cameraDevices.length > 0);
        }
    }, []);

    const onMicrophoneDevicesChanged = useCallback((devices: MediaDeviceInfo[]) => {
        const microphoneDevices: MediaDeviceInfo[] = [];
        for (const microphoneDevice of devices) {
            if (!microphoneDevice.deviceId) {
                continue;
            }
            microphoneDevices.push(microphoneDevice);
            setMicrophoneDevices(microphoneDevices);
            setIsMicrophoneAccessible(microphoneDevices.length > 0);
        }
    }, []);

    useEffect(() => {
        deviceTest.onVolumeChanged = setVolume;
        deviceTest.onCameraDevicesChanged = onCameraDevicesChanged;
        deviceTest.onMicrophoneDevicesChanged = onMicrophoneDevicesChanged;

        deviceTest.initializeCameraDevices().catch((error: any) => {
            if (DeviceTest.isPermissionError(error)) {
                setIsCameraAccessible(false);
            }
        });

        deviceTest.initializeMicrophoneDevices().catch((error: any) => {
            if (DeviceTest.isPermissionError(error)) {
                setIsMicrophoneAccessible(false);
            }
        });

        return deviceTest.destroy.bind(deviceTest);
    }, [deviceTest, onCameraDevicesChanged, onMicrophoneDevicesChanged]);

    useEffect(() => {
        if (cameraDeviceId) {
            void deviceTest.setCamera(cameraDeviceId).catch((error: any) => {
                if (DeviceTest.isPermissionError(error)) {
                    setIsCameraAccessible(false);
                }
            });
        }
    }, [cameraDeviceId, deviceTest]);

    useEffect(() => {
        if (microphoneDeviceId) {
            void deviceTest.setMicrophone(microphoneDeviceId).catch((error: any) => {
                if (DeviceTest.isPermissionError(error)) {
                    setIsMicrophoneAccessible(false);
                }
            });
        }
    }, [microphoneDeviceId, deviceTest]);

    const joinRoom = async (): Promise<void> => {
        configStore.updateCameraId(cameraDeviceId);
        configStore.updateMicrophoneId(microphoneDeviceId);
        await joinRoomHandler(roomUUID, pushHistory);
    };

    return (
        <div className="device-test-page-container">
            <div className="device-test-panel-box">
                <DeviceTestPanel
                    cameraDevices={cameraDevices}
                    microphoneDevices={microphoneDevices}
                    speakerTestFileName={"Music"}
                    microphoneVolume={volume}
                    currentCameraDeviceID={cameraDeviceId}
                    currentSpeakerDeviceID={"default browser"}
                    currentMicrophoneDeviceID={microphoneDeviceId}
                    isCameraAccessible={isCameraAccessible}
                    isMicrophoneAccessible={isMicrophoneAccessible}
                    isSpeakerAccessible={true}
                    cameraVideoStreamRef={cameraVideoStreamRef}
                    setCameraDevice={setCameraDeviceId}
                    // Currently, the browser does not support switch speaker devices
                    setSpeakerDevice={() => null}
                    setMicrophoneDevice={setMicrophoneDeviceId}
                    toggleDeviceTest={() => globalStore.toggleDeviceTest()}
                    joinRoom={joinRoom}
                />
            </div>
        </div>
    );
});

export default DevicesTestPage;
