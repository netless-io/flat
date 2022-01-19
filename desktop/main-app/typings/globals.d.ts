import AgoraRtcSDK from "agora-electron-sdk";
import { Runtime } from "../src/utils/runtime";

declare namespace NodeJS {
    export interface Global {
        runtime: Runtime;
    }

    export interface ProcessEnv {
        NODE_ENV: "development" | "production";
        FLAT_DEBUG?: "debug";
        UPDATE_DOMAIN: string;
    }
}

declare global {
    interface Window {
        rtcEngine: AgoraRtcSDK;
        $: any;
        jQuery: any;
    }
}
