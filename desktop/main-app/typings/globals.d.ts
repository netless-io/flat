declare namespace NodeJS {
    export interface Global {
        runtime: import("../src/utils/runtime").Runtime;
    }

    export interface ProcessEnv {
        NODE_ENV: "development" | "production";
        UPDATE_DOMAIN: string;
    }
}

interface Window {
    rtcEngine: any;
    $: any;
    jQuery: any;
}
