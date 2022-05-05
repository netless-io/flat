import type { FlatRTC } from "@netless/flat-rtc";
import { FlatRTCAgoraWeb } from "@netless/flat-rtc-agora-web";

export function initFlatRTC(): void {
    FlatRTCAgoraWeb.APP_ID = process.env.AGORA_APP_ID;
}

export const getFlatRTC: () => FlatRTC = FlatRTCAgoraWeb.getInstance;
