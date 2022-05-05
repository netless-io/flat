import type { FlatRTC } from "@netless/flat-rtc";
import { FlatRTCAgoraElectron } from "@netless/flat-rtc-agora-electron";

export function initFlatRTC(): Promise<void> {
    const agoraRtcSDK$ = (window as any).agoraRtcSDK$;
    if (!agoraRtcSDK$) {
        throw new Error("Missing agora rtc electron sdk global");
    }

    return new Promise(resolve => {
        agoraRtcSDK$.subscribe((rtcEngine: any) => {
            if (rtcEngine) {
                FlatRTCAgoraElectron.APP_ID = process.env.AGORA_APP_ID;
                FlatRTCAgoraElectron.setRtcEngine(rtcEngine);
                resolve();
            }
        });
    });
}

export const getFlatRTC: () => FlatRTC = FlatRTCAgoraElectron.getInstance;
