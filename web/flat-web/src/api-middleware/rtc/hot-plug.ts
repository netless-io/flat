import AgoraRTC, { DeviceInfo, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

let microphoneTrack: IMicrophoneAudioTrack | undefined;
export function setMicrophoneTrack(track?: IMicrophoneAudioTrack): void {
    microphoneTrack = track;
}

let cameraTrack: ICameraVideoTrack | undefined;
export function setCameraTrack(track?: ICameraVideoTrack): void {
    cameraTrack = track;
}

export type DeviceChangedCallback = (changedDevice: DeviceInfo) => void;
const listeners = {
    microphone: new Set<DeviceChangedCallback>(),
    camera: new Set<DeviceChangedCallback>(),
    speaker: new Set<DeviceChangedCallback>(),
} as const;

export type DeviceType = keyof typeof listeners;

AgoraRTC.onMicrophoneChanged = (device: DeviceInfo): void => {
    listeners.microphone.forEach(callback => callback(device));
};

AgoraRTC.onCameraChanged = (device: DeviceInfo): void => {
    listeners.camera.forEach(callback => callback(device));
};

AgoraRTC.onPlaybackDeviceChanged = (device: DeviceInfo): void => {
    listeners.speaker.forEach(callback => callback(device));
};

export function addEventListener(type: DeviceType, callback: DeviceChangedCallback): void {
    listeners[type].add(callback);
}

export function removeEventListener(type: DeviceType, callback: DeviceChangedCallback): void {
    listeners[type].delete(callback);
}

export const HotPlugMicrophone: DeviceChangedCallback = async changedDevice => {
    if (changedDevice.state === "ACTIVE") {
        console.log("[rtc] microphone new device: %s", changedDevice.device.deviceId);
        microphoneTrack?.setDevice(changedDevice.device.deviceId);
    } else if (changedDevice.device.label === microphoneTrack?.getTrackLabel()) {
        console.log("[rtc] microphone pull out");
        const [microphone] = await AgoraRTC.getMicrophones();
        console.log("[rtc] microphone old device: %s", microphone.deviceId);
        microphone && microphoneTrack.setDevice(microphone.deviceId);
    }
};

export const HotPlugCamera: DeviceChangedCallback = async changedDevice => {
    if (changedDevice.state === "ACTIVE") {
        console.log("[rtc] camera new device: %s", changedDevice.device.deviceId);
        cameraTrack?.setDevice(changedDevice.device.deviceId);
    } else if (changedDevice.device.label === cameraTrack?.getTrackLabel()) {
        console.log("[rtc] camera pull out");
        const [camera] = await AgoraRTC.getMicrophones();
        console.log("[rtc] camera old device: %s", camera.deviceId);
        camera && cameraTrack.setDevice(camera.deviceId);
    }
};

export type Disposer = () => void;

export function hotPlug(): Disposer {
    addEventListener("microphone", HotPlugMicrophone);
    addEventListener("camera", HotPlugCamera);
    return () => {
        removeEventListener("microphone", HotPlugMicrophone);
        removeEventListener("camera", HotPlugCamera);
    };
}
