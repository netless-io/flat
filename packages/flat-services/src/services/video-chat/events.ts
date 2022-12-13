import type { Remitter } from "remitter";

/**
 * Network quality types:
 *
 * - 0: The network quality is unknown.
 * - 1: The network quality is excellent.
 * - 2: The network quality is quite good, but the bitrate may be slightly lower than excellent.
 * - 3: Users can feel the communication slightly impaired.
 * - 4: Users cannot communicate smoothly.
 * - 5: The network is so bad that users can barely communicate.
 * - 6: The network is down and users cannot communicate at all.
 * - 7: Users cannot detect the network quality.
 * - 8: Detecting the network quality.
 */
export type IServiceVideoChatNetworkQualityType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface IServiceVideoChatEventData {
    "network": {
        delay: number;
        uplink: IServiceVideoChatNetworkQualityType;
        downlink: IServiceVideoChatNetworkQualityType;
    };
    "network-test": IServiceVideoChatNetworkQualityType;
    "volume-level-changed": number;
    /** When a video capture device is added or removed */
    "camera-changed": string;
    /** When an audio sampling device is added or removed */
    "mic-changed": string;
    /** When an audio playback device is added or removed */
    "speaker-changed": string;
    "err-set-camera": Error;
    "err-set-mic": Error;
    "err-low-volume": undefined;
    "error": Error;
}

export type IServiceVideoChatEventNames = keyof IServiceVideoChatEventData;

export type IServiceVideoChatEvents = Remitter<IServiceVideoChatEventData>;
