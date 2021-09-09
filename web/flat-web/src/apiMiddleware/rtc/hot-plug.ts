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
        microphoneTrack?.setDevice(changedDevice.device.deviceId);
    } else if (changedDevice.device.label === microphoneTrack?.getTrackLabel()) {
        const [microphone] = await AgoraRTC.getMicrophones();
        microphone && microphoneTrack.setDevice(microphone.deviceId);
    }
};

AgoraRTC.onCameraChanged = async changedDevice => {
    if (changedDevice.state === "ACTIVE") {
        cameraTrack?.setDevice(changedDevice.device.deviceId);
    } else if (changedDevice.device.label === cameraTrack?.getTrackLabel()) {
        const [camera] = await AgoraRTC.getMicrophones();
        camera && cameraTrack.setDevice(camera.deviceId);
    }
};
