import { FlatPrefersColorScheme, Region } from "flat-components";
import { i18n } from "flat-i18n";
import { autoPersistStore } from "./utils/auto-persist-store";

// clear storage if not match
const LS_VERSION = 1;

/**
 * User preferences
 *
 * Properties in Preferences Store are persisted and shared globally.
 */
export class PreferencesStore {
    /** Turn on camera when joining room */
    public autoCameraOn = false;
    /** Turn on mic when joining room */
    public autoMicOn = true;
    /** Region, default by language */
    public region: Region | null = null;
    /** selected camera device id on devices test page */
    public cameraId?: string | null = null;
    /** selected microphone device id on devices test page */
    public microphoneId?: string | null = null;

    public prefersColorScheme: FlatPrefersColorScheme = "light";

    public constructor() {
        autoPersistStore({ storeLSName: "PreferencesStore", store: this, version: LS_VERSION });
    }

    public updateAutoCameraOn = (isOn: boolean): void => {
        this.autoCameraOn = isOn;
    };

    public updateAutoMicOn = (isOn: boolean): void => {
        this.autoMicOn = isOn;
    };

    public updateCameraId = (cameraId: string): void => {
        this.cameraId = cameraId;
    };

    public updateMicrophoneId = (microphoneId: string): void => {
        this.microphoneId = microphoneId;
    };

    public setRegion = (region: Region): void => {
        this.region = region;
    };

    public getRegion = (): Region => {
        return this.region || (i18n.language.startsWith("zh") ? Region.CN_HZ : Region.US_SV);
    };

    public updatePrefersColorScheme = (prefersColorScheme: FlatPrefersColorScheme): void => {
        this.prefersColorScheme = prefersColorScheme;
    };
}

export const preferencesStore = new PreferencesStore();
