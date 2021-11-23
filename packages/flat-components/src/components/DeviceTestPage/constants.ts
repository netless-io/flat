export interface Device {
    deviceId: string;
    groupId: string;
    kind: "audioinput" | "audiooutput" | "videoinput";
    label: string;
}
