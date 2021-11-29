import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { addEventListener, removeEventListener } from "./hot-plug";

export class DeviceTest {
    public devices: MediaDeviceInfo[] = [];
    public onDevicesChanged?: (devices: MediaDeviceInfo[]) => void;

    public cameraVideoTrack?: ICameraVideoTrack;
    public microphoneAudioTrack?: IMicrophoneAudioTrack;

    public volume = 0;
    public onVolumeChanged?: (volume: number) => void;
    private volumeTimer = NaN;

    public cameraElement: HTMLDivElement | null = null;

    public constructor() {
        addEventListener("camera", this.refreshDevices);
        addEventListener("microphone", this.refreshDevices);
        this.refreshVolume();
    }

    public initialize(): Promise<void> {
        return this.refreshDevices();
    }

    public refreshDevices = async (): Promise<void> => {
        this.devices = await AgoraRTC.getDevices(true);
        if (this.onDevicesChanged) {
            this.onDevicesChanged(this.devices);
        }
    };

    public setCameraElement(cameraElement: HTMLDivElement | null): void {
        this.cameraElement = cameraElement;
    }

    public refreshVolume = (): void => {
        if (this.microphoneAudioTrack) {
            const volume = this.microphoneAudioTrack.getVolumeLevel();
            if (this.volume !== volume) {
                this.volume = volume;
            }
            if (this.onVolumeChanged) {
                this.onVolumeChanged(Math.min(volume + Math.random() * 0.05, 1));
            }
        }
        this.volumeTimer = window.setTimeout(this.refreshVolume, 50);
    };

    public async setCamera(deviceId: string): Promise<void> {
        if (this.cameraVideoTrack) {
            await this.cameraVideoTrack.setDevice(deviceId);
        } else {
            this.cameraVideoTrack = await AgoraRTC.createCameraVideoTrack({
                cameraId: deviceId,
            });
            if (this.cameraElement) {
                this.cameraVideoTrack.play(this.cameraElement);
            }
        }
    }

    public async setMicrophone(deviceId: string): Promise<void> {
        if (this.microphoneAudioTrack) {
            await this.microphoneAudioTrack.setDevice(deviceId);
        } else {
            this.microphoneAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                microphoneId: deviceId,
            });
        }
    }

    public destroy(): void {
        window.clearTimeout(this.volumeTimer);
        removeEventListener("camera", this.refreshDevices);
        removeEventListener("microphone", this.refreshDevices);
        if (this.cameraVideoTrack) {
            this.cameraVideoTrack.close();
            this.cameraVideoTrack = undefined;
        }
        if (this.microphoneAudioTrack) {
            this.microphoneAudioTrack.close();
            this.microphoneAudioTrack = undefined;
        }
    }

    public static isPermissionError(error: any): error is Error {
        return "code" in error && "message" in error && error.code === "PERMISSION_DENIED";
    }
}
