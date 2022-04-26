import type { FlatRTM } from "@netless/flat-rtm";
import { FlatRTMAgora } from "@netless/flat-rtm-agora";

export function initFlatRTM(): void {
    FlatRTMAgora.APP_ID = process.env.AGORA_APP_ID;
}

export const getFlatRTM: () => FlatRTM = FlatRTMAgora.getInstance;
