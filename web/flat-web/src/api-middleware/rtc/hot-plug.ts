import AgoraRTC, { ICameraVideoTrack } from "agora-rtc-sdk-ng";
import type { IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

let microphoneTrack: IMicrophoneAudioTrack | undefined;
export function setMicrophoneTrack(track?: IMicrophoneAudioTrack): void {
    microphoneTrack = track;
}

let cameraTrack: ICameraVideoTrack | undefined;
export function setCameraTrack(track?: ICameraVideoTrack): void {
    cameraTrack = track;
}

AgoraRTC.onMicrophoneChanged = async changedDevice => {
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

AgoraRTC.onCameraChanged = async changedDevice => {
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
