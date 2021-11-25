import { app } from "electron";

export default (): void => {
    // disable warning: "kq_init: detected broken kqueue; not using."
    // link: https://github.com/tmux/tmux/issues/475
    // but i don’t know where tmux is referenced. If you can find it and submit a PR, we would be very grateful.
    // @ts-ignore
    process.env.EVENT_NOKQUEUE = 1;

    app.setAsDefaultProtocolClient("x-agora-flat-client");

    // support more WebGL contexts
    // RTC and PPT will occupy WebGL contexts
    app.commandLine.appendSwitch("max-active-webgl-contexts", "40");
};
