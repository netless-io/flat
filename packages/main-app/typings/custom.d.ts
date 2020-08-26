declare interface Context {
    runtime: import("../src/utils/Runtime").Runtime;
    wins: {
        [key in "main"]: import("electron").BrowserWindow;
    };
}
