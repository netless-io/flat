declare namespace NodeJS {
    export interface Global {
        runtime: import("../src/utils/runtime").Runtime;
    }
}

interface Window {
    rtcEngine: any;
    $: any;
    jQuery: any;
}
