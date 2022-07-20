import { flatServices } from "@netless/flat-services";

export function initFlatServices(): void {
    flatServices.register("rtc", async () => {
        const { FlatRTCAgoraWeb } = await import("@netless/flat-rtc-agora-web");
        FlatRTCAgoraWeb.APP_ID = process.env.AGORA_APP_ID;
        return FlatRTCAgoraWeb.getInstance();
    });

    flatServices.register("rtm", async () => {
        const { FlatRTMAgora } = await import("@netless/flat-rtm-agora");
        FlatRTMAgora.APP_ID = process.env.AGORA_APP_ID;
        return FlatRTMAgora.getInstance();
    });
}
