import { initFlatRTC } from "./flat-rtc";
import { initFlatRTM } from "./flat-rtm";

export function initServices(): void {
    initFlatRTC();
    initFlatRTM();
}
