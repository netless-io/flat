import { BrowserWindow } from "electron";

class Windows {
    private wins: Wins = {} as Wins;
    private winsState: WinsState;

    public constructor() {
        this.winsState = {
            main: {
                realClose: true,
            },
        };
    }

    public get main(): BrowserWindow {
        return this.wins.main;
    }
    public set main(value: BrowserWindow) {
        this.wins.main = value;
    }
    public get mainState(): WinsState["main"] {
        return this.winsState.main;
    }
    public set mainState(value: WinsState["main"]) {
        this.winsState.main = {
            ...this.winsState.main,
            ...value,
        };
    }
}

export const windows = new Windows();

type Wins = {
    [k in "main"]: BrowserWindow;
};

type WinsState = {
    main: {
        realClose: boolean;
    };
};
