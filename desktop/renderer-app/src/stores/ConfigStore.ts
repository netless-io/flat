import { autoPersistStore } from "./utils";

// clear storage if not match
const LS_VERSION = 1;

/**
 * Properties in Config Store are persisted and shared globally.
 */
export class ConfigStore {
    /** Turn on camera when joining room */
    public autoCameraOn = false;
    /** Turn on mic when joining room */
    public autoMicOn = true;

    public constructor() {
        autoPersistStore({ storeLSName: "ConfigStore", store: this, version: LS_VERSION });
    }

    public updateAutoCameraOn = (isOn: boolean): void => {
        this.autoCameraOn = isOn;
    };

    public updateAutoMicOn = (isOn: boolean): void => {
        this.autoMicOn = isOn;
    };
}

export const configStore = new ConfigStore();
