export interface DeviceCheckResults {
    systemCheck?: DeviceCheckState;
    cameraCheck?: DeviceCheckState;
    speakerCheck?: DeviceCheckState;
    microphoneCheck?: DeviceCheckState;
}

export type DeviceCheckState = {
    content?: string;
    hasError?: boolean;
};
