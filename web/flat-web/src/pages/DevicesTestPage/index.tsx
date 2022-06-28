import "./style.less";

import { DeviceTestPanel } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FlatRTCDevice } from "@netless/flat-rtc";

import { DeviceTest } from "../../api-middleware/rtc/device-test";
import { useParams } from "react-router-dom";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { joinRoomHandler } from "../utils/join-room-handler";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { configStore } from "../../stores/config-store";
import { FlatRTCContext } from "../../components/FlatRTCContext";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { useLoginCheck } from "../utils/use-login-check";

export const DevicesTestPage = observer(function DeviceTestPage() {
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const rtc = useContext(FlatRTCContext);
    const sp = useSafePromise();

    useLoginCheck();

    const { roomUUID } = useParams<RouteParams<RouteNameType.JoinPage>>();

    const cameraVideoStreamRef = useRef<HTMLDivElement>(null);

    const [cameraDevices, setCameraDevices] = useState<FlatRTCDevice[]>([]);
    const [microphoneDevices, setMicrophoneDevices] = useState<FlatRTCDevice[]>([]);

    const [cameraDeviceId, setCameraDeviceId] = useState<string>("");
    const [microphoneDeviceId, setMicrophoneDeviceId] = useState<string>("");

    const [isCameraAccessible, setIsCameraAccessible] = useState(true);
    const [isMicrophoneAccessible, setIsMicrophoneAccessible] = useState(true);

    const [volume, setVolume] = useState(0);

    useEffect(() => {
        // @FIXME only run once
        const avatar = rtc.getTestAvatar();
        if (avatar) {
            avatar.enableCamera(true);
            avatar.enableMic(true);
            avatar.setElement(cameraVideoStreamRef.current);

            const ticket = window.setInterval(() => {
                // add noise
                setVolume(Math.min(avatar.getVolumeLevel() + Math.random() * 0.05, 1));
            }, 50);

            return () => {
                window.clearInterval(ticket);
                avatar.destroy();
            };
        }
        return;
    }, [rtc, cameraVideoStreamRef]);

    useEffect(() => {
        const handlerDeviceError = (error: any): void => {
            if (DeviceTest.isPermissionError(error)) {
                setIsCameraAccessible(false);
            }
        };

        const refreshCameraDevices = (): void => {
            sp(rtc.getCameraDevices())
                .then(devices => {
                    const cameraDevices = devices.filter(device => device.deviceId);
                    setCameraDevices(cameraDevices);
                    setIsCameraAccessible(cameraDevices.length > 0);
                })
                .catch(handlerDeviceError);
        };

        const refreshMicDevices = (): void => {
            sp(rtc.getMicDevices())
                .then(devices => {
                    const microphoneDevices = devices.filter(device => device.deviceId);
                    setMicrophoneDevices(microphoneDevices);
                    setIsMicrophoneAccessible(microphoneDevices.length > 0);
                })
                .catch(handlerDeviceError);
        };

        const cameraChangeDisposer = rtc.events.on("camera-changed", refreshCameraDevices);
        const micChangedDisposer = rtc.events.on("mic-changed", refreshMicDevices);

        refreshCameraDevices();
        refreshMicDevices();

        return () => {
            cameraChangeDisposer();
            micChangedDisposer();
        };
    }, [rtc, sp]);

    useEffect(() => {
        if (cameraDeviceId) {
            void rtc.setCameraID(cameraDeviceId).catch((error: any) => {
                if (DeviceTest.isPermissionError(error)) {
                    setIsCameraAccessible(false);
                }
            });
        }
    }, [rtc, cameraDeviceId]);

    useEffect(() => {
        if (microphoneDeviceId) {
            void rtc.setMicID(microphoneDeviceId).catch((error: any) => {
                if (DeviceTest.isPermissionError(error)) {
                    setIsMicrophoneAccessible(false);
                }
            });
        }
    }, [rtc, microphoneDeviceId]);

    useEffect(() => {
        // check device id on changes
        if (cameraDevices.length > 0 && !cameraDeviceId) {
            const lastCameraId = configStore.cameraId;
            lastCameraId
                ? setCameraDeviceId(lastCameraId)
                : setCameraDeviceId(cameraDevices[0].deviceId);
        }
    }, [cameraDeviceId, cameraDevices]);

    useEffect(() => {
        // check device id on changes
        if (microphoneDevices.length > 0 && !microphoneDeviceId) {
            const lastMicrophoneId = configStore.microphoneId;
            lastMicrophoneId
                ? setMicrophoneDeviceId(lastMicrophoneId)
                : setMicrophoneDeviceId(microphoneDevices[0].deviceId);
        }
    }, [microphoneDeviceId, microphoneDevices]);

    const joinRoom = async (): Promise<void> => {
        configStore.updateCameraId(cameraDeviceId);
        configStore.updateMicrophoneId(microphoneDeviceId);
        await joinRoomHandler(roomUUID, pushHistory);
    };

    return (
        <div className="device-test-page-container ">
            <div className="device-test-panel-box">
                <DeviceTestPanel
                    cameraDevices={cameraDevices}
                    cameraVideoStreamRef={cameraVideoStreamRef}
                    currentCameraDeviceID={cameraDeviceId}
                    currentMicrophoneDeviceID={microphoneDeviceId}
                    currentSpeakerDeviceID={"default browser"}
                    isCameraAccessible={isCameraAccessible}
                    isMicrophoneAccessible={isMicrophoneAccessible}
                    isSpeakerAccessible={true}
                    joinRoom={joinRoom}
                    microphoneDevices={microphoneDevices}
                    microphoneVolume={volume}
                    setCameraDevice={setCameraDeviceId}
                    // Currently, the browser does not support switch speaker devices
                    setMicrophoneDevice={setMicrophoneDeviceId}
                    setSpeakerDevice={() => null}
                    speakerTestFileName={"Music"}
                    toggleDeviceTest={() => globalStore.toggleDeviceTest()}
                />
            </div>
        </div>
    );
});

export default DevicesTestPage;
