import type { FlatRTC } from "@netless/flat-rtc";
import { FlatRTCAgoraWeb } from "@netless/flat-rtc-agora-web";
import { AGORA } from "../constants/process";

export function initFlatRTC(): void {
    FlatRTCAgoraWeb.APP_ID = AGORA.APP_ID;
}

export const getFlatRTC: () => FlatRTC = FlatRTCAgoraWeb.getInstance;
