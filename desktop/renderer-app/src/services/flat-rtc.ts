import type { FlatRTC } from "@netless/flat-rtc";
import { FlatRTCAgoraElectron } from "@netless/flat-rtc-agora-electron";

export function initFlatRTC(): void {
    window.addEventListener("agora-sdk", () => {
        FlatRTCAgoraElectron.setRtcEngine(window.rtcEngine);
    });
}

export const getFlatRTC: () => FlatRTC = FlatRTCAgoraElectron.getInstance;
