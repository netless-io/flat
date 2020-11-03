declare interface Context {
    runtime: import("types-pkg").runtime.Type;
    wins: {
        [key in "main"]: import("electron").BrowserWindow;
    };
}
