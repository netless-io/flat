declare namespace NodeJS {
    export interface Global {
        runtime: import("../src/utils/runtime").Runtime;
    }

    export interface ProcessEnv {
        NODE_ENV: "development" | "production";
        FLAT_DEBUG?: "debug";
        UPDATE_DOMAIN: string;
    }
}

interface Window {
    rtcEngine: any;
    $: any;
    jQuery: any;
}
