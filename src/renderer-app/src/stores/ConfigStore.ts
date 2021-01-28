import { autoPersistStore } from "./utils";

/**
 * Properties in Config Store are persisted and shared globally.
 */
export class ConfigStore {
    /** Turn on camera when joining room */
    autoCameraOn = false;
    /** Turn on mic when joining room */
    autoMicOn = false;

    constructor() {
        autoPersistStore("ConfigStore", this);
    }

    updateAutoCameraOn = (isOn: boolean): void => {
        this.autoCameraOn = isOn;
    };

    updateAutoMicOn = (isOn: boolean): void => {
        this.autoMicOn = isOn;
    };
}

export const configStore = new ConfigStore();
