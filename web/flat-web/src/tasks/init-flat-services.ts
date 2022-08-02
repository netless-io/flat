import { flatServices } from "@netless/flat-services";

export function initFlatServices(): void {
    flatServices.register("videoChat", async () => {
        const { AgoraRTCWeb } = await import("@netless/flat-rtc-agora-web");
        return new AgoraRTCWeb({ APP_ID: process.env.AGORA_APP_ID });
    });

    flatServices.register("rtm", async () => {
        const { FlatRTMAgora } = await import("@netless/flat-rtm-agora");
        FlatRTMAgora.APP_ID = process.env.AGORA_APP_ID;
        return FlatRTMAgora.getInstance();
    });
}
