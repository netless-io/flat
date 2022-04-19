export interface FlatRTCAvatar {
    enableCamera(enabled: boolean): void;
    enableMic(enabled: boolean): void;
    setElement(element: HTMLElement | null): void;
    getVolumeLevel(): number;
    destroy(): void;
}
