import type { FlatRTC } from "@netless/flat-rtc";
import { FlatRTCAgoraElectron } from "@netless/flat-rtc-agora-electron";
import { AGORA } from "../constants/process";

export function initFlatRTC(): Promise<void> {
    const agoraRtcSDK$ = (window as any).agoraRtcSDK$;
    if (!agoraRtcSDK$) {
        throw new Error("Missing agora rtc electron sdk global");
    }

    return new Promise(resolve => {
        agoraRtcSDK$.subscribe((rtcEngine: any) => {
            if (rtcEngine) {
                FlatRTCAgoraElectron.APP_ID = AGORA.APP_ID;
                FlatRTCAgoraElectron.setRtcEngine(rtcEngine);
                resolve();
            }
        });
    });
}

export const getFlatRTC: () => FlatRTC = FlatRTCAgoraElectron.getInstance;
