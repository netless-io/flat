import "./style.less";

import { DeviceTestPanel } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useRef, useState } from "react";
import { IServiceVideoChatDevice } from "@netless/flat-services";

import { noop } from "lodash-es";
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
    const rtc = useFlatService("videoChat");
    const preferencesStore = useContext(PreferencesStoreContext);
    const sp = useSafePromise();

    useLoginCheck();

    const { roomUUID } = useParams<RouteParams<RouteNameType.JoinPage>>();

    const cameraVideoStreamRef = useRef<HTMLDivElement>(null);

    const [cameraDevices, setCameraDevices] = useState<IServiceVideoChatDevice[]>([]);
    const [microphoneDevices, setMicrophoneDevices] = useState<IServiceVideoChatDevice[]>([]);
    const [speakerDevices, setSpeakerDevices] = useState<IServiceVideoChatDevice[]>([]);

    const [cameraDeviceId, setCameraDeviceId] = useState<string>(preferencesStore.cameraId || "");
    const [microphoneDeviceId, setMicrophoneDeviceId] = useState<string>(
        preferencesStore.microphoneId || "",
    );
    const [speakerDeviceId, setSpeakerDeviceId] = useState<string>(
        preferencesStore.speakerId || "",
    );

    const [isCameraAccessible, setIsCameraAccessible] = useState(true);
    const [isMicrophoneAccessible, setIsMicrophoneAccessible] = useState(true);
    const [isSpeakerAccessible, setIsSpeakerAccessible] = useState(true);

    const [volume, setVolume] = useState(0);

    // Make 'setDeviceID' happen first when the track was not created.
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
        if (rtc && speakerDeviceId) {
            void rtc.setSpeakerID(speakerDeviceId).catch(() => {
                setIsSpeakerAccessible(false);
            });
        }
    }, [rtc, speakerDeviceId]);

    useEffect(() => {
        if (!rtc) {
            return;
        }
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
                avatar.enableCamera(false);
                avatar.enableMic(false);
                avatar.setElement(null);
                rtc.stopTesting();
            };
        }
        return;
    }, [rtc, cameraVideoStreamRef]);

    useEffect(() => {
        if (!rtc) {
            return;
        }

        const refreshCameraDevices = (): void => {
            sp(rtc.getCameraDevices())
                .then(devices => {
                    const cameraDevices = devices.filter(device => device.deviceId);
                    setCameraDevices(cameraDevices);
                    setIsCameraAccessible(cameraDevices.length > 0);
                })
                .catch(() => {
                    setIsCameraAccessible(false);
                });
        };

        const refreshMicDevices = (): void => {
            sp(rtc.getMicDevices())
                .then(devices => {
                    const microphoneDevices = devices.filter(device => device.deviceId);
                    setMicrophoneDevices(microphoneDevices);
                    setIsMicrophoneAccessible(microphoneDevices.length > 0);
                })
                .catch(() => {
                    setIsMicrophoneAccessible(false);
                });
        };

        const refreshSpeakerDevices = (): void => {
            sp(rtc.getSpeakerDevices())
                .then(devices => {
                    const speakerDevices = devices.filter(device => device.deviceId);
                    setSpeakerDevices(speakerDevices);
                    setIsMicrophoneAccessible(speakerDevices.length > 0);
                })
                .catch(() => {
                    setIsSpeakerAccessible(false);
                });
        };

        const cameraChangeDisposer = rtc.events.on("camera-changed", refreshCameraDevices);
        const micChangedDisposer = rtc.events.on("mic-changed", refreshMicDevices);
        const speakerChangedDisposer = rtc.events.on("speaker-changed", refreshSpeakerDevices);

        refreshCameraDevices();
        refreshMicDevices();
        refreshSpeakerDevices();

        return () => {
            cameraChangeDisposer();
            micChangedDisposer();
            speakerChangedDisposer();
        };
    }, [rtc, sp]);

    useEffect(() => {
        // check device id on changes
        if (
            cameraDevices.length > 0 &&
            !cameraDevices.find(device => device.deviceId === cameraDeviceId)
        ) {
            setCameraDeviceId(cameraDevices[0].deviceId);
        }
    }, [preferencesStore, cameraDeviceId, cameraDevices]);

    useEffect(() => {
        // check device id on changes
        if (
            microphoneDevices.length > 0 &&
            !microphoneDevices.some(device => device.deviceId === microphoneDeviceId)
        ) {
            setMicrophoneDeviceId(microphoneDevices[0].deviceId);
        }
    }, [preferencesStore, microphoneDeviceId, microphoneDevices]);

    useEffect(() => {
        // check device id on changes
        if (
            speakerDevices.length > 0 &&
            !speakerDevices.some(device => device.deviceId === speakerDeviceId)
        ) {
            setSpeakerDeviceId(speakerDevices[0].deviceId);
        }
    }, [preferencesStore, speakerDeviceId, speakerDevices]);

    useEffect(() => {
        if (rtc) {
            rtc.setMirrorMode(preferencesStore.mirrorMode);
        }
    }, [preferencesStore.mirrorMode, rtc]);

    const joinRoom = async (): Promise<void> => {
        preferencesStore.updateSpeakerId(speakerDeviceId);
        preferencesStore.updateCameraId(cameraDeviceId);
        preferencesStore.updateMicrophoneId(microphoneDeviceId);
        await joinRoomHandler(roomUUID, pushHistory);
    };

    return (
        <div className="device-test-page-container">
            <div className="device-test-panel-box">
                <DeviceTestPanel
                    autoCameraOn={preferencesStore.autoCameraOn}
                    autoMicOn={preferencesStore.autoMicOn}
                    cameraDevices={cameraDevices}
                    cameraVideoStreamRef={cameraVideoStreamRef}
                    currentCameraDeviceID={cameraDeviceId}
                    currentMicrophoneDeviceID={microphoneDeviceId}
                    currentSpeakerDeviceID={speakerDeviceId}
                    isCameraAccessible={isCameraAccessible}
                    isMicrophoneAccessible={isMicrophoneAccessible}
                    isSpeakerAccessible={isSpeakerAccessible}
                    isTurnOffDeviceTest={globalStore.isTurnOffDeviceTest}
                    joinRoom={joinRoom}
                    microphoneDevices={microphoneDevices}
                    microphoneVolume={volume}
                    mirrorMode={preferencesStore.mirrorMode}
                    setCameraDevice={setCameraDeviceId}
                    setMicrophoneDevice={setMicrophoneDeviceId}
                    setSpeakerDevice={setSpeakerDeviceId}
                    speakerDevices={speakerDevices}
                    speakerTestFileName={"Music"}
                    startSpeakerTest={rtc ? rtc.startSpeakerTest : noop}
                    stopSpeakerTest={rtc ? rtc.stopSpeakerTest : noop}
                    toggleAutoCameraOn={() =>
                        preferencesStore.updateAutoCameraOn(!preferencesStore.autoCameraOn)
                    }
                    toggleAutoMicOn={() =>
                        preferencesStore.updateAutoMicOn(!preferencesStore.autoMicOn)
                    }
                    toggleDeviceTest={globalStore.toggleDeviceTest}
                    toggleMirrorMode={() =>
                        preferencesStore.updateMirrorMode(!preferencesStore.mirrorMode)
                    }
                />
            </div>
        </div>
    );
});

export default DevicesTestPage;
