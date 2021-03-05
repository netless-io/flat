declare namespace NodeJS {
    export interface Global {
        runtime: import("../src/utils/runtime").Runtime;
    }
}

interface Window {
    AgoraRtcEngine: any;
    rtcEngine: any;
    $: any;
    jQuery: any;
}
