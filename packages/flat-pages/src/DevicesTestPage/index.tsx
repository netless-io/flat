import "./style.less";

import { DeviceTestPanel } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FlatRTCDevice } from "@netless/flat-rtc";

import { useParams } from "react-router-dom";
import { RouteNameType, RouteParams, usePushHistory } from "../utils/routes";
import { joinRoomHandler } from "../utils/join-room-handler";
import { GlobalStoreContext, PreferencesStoreContext } from "../components/StoreProvider";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { useLoginCheck } from "../utils/use-login-check";
import { useFlatService } from "../components/FlatServicesContext";

export const DevicesTestPage = observer(function DeviceTestPage() {
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const rtc = useFlatService("rtc");
    const preferencesStore = useContext(PreferencesStoreContext);
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
        if (!rtc) {
            return;
        }
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
        if (!rtc) {
            return;
        }

        const handlerDeviceError = (): void => {
            setIsCameraAccessible(false);
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
        if (rtc && cameraDeviceId) {
            void rtc.setCameraID(cameraDeviceId).catch(() => {
                setIsCameraAccessible(false);
            });
        }
    }, [rtc, cameraDeviceId]);

    useEffect(() => {
        if (rtc && microphoneDeviceId) {
            void rtc.setMicID(microphoneDeviceId).catch(() => {
                setIsMicrophoneAccessible(false);
            });
        }
    }, [rtc, microphoneDeviceId]);

    useEffect(() => {
        // check device id on changes
        if (cameraDevices.length > 0 && !cameraDeviceId) {
            const lastCameraId = preferencesStore.cameraId;
            lastCameraId
                ? setCameraDeviceId(lastCameraId)
                : setCameraDeviceId(cameraDevices[0].deviceId);
        }
    }, [preferencesStore, cameraDeviceId, cameraDevices]);

    useEffect(() => {
        // check device id on changes
        if (microphoneDevices.length > 0 && !microphoneDeviceId) {
            const lastMicrophoneId = preferencesStore.microphoneId;
            lastMicrophoneId
                ? setMicrophoneDeviceId(lastMicrophoneId)
                : setMicrophoneDeviceId(microphoneDevices[0].deviceId);
        }
    }, [preferencesStore, microphoneDeviceId, microphoneDevices]);

    const joinRoom = async (): Promise<void> => {
        preferencesStore.updateCameraId(cameraDeviceId);
        preferencesStore.updateMicrophoneId(microphoneDeviceId);
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
