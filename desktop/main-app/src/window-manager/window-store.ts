import { constants } from "flat-types";
import { AbstractWindows } from "./abstract";

export class WindowStore<CUSTOM_WINDOWS extends AbstractWindows> {
    public constructor(protected readonly wins: CUSTOM_WINDOWS) {}

    public window<NAME extends constants.WindowsName>(name: NAME): CUSTOM_WINDOWS[NAME]["win"] {
        return this.wins[name].win;
    }

    public customWindow<NAME extends constants.WindowsName>(name: NAME): CUSTOM_WINDOWS[NAME] {
        return this.wins[name];
    }
}
