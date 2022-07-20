import { flatServices } from "@netless/flat-services";
import { FlatRTCAgoraWeb } from "@netless/flat-rtc-agora-web";
import { FlatRTMAgora } from "@netless/flat-rtm-agora";

export function initFlatServices(): void {
    flatServices.register("rtc", async () => {
        FlatRTCAgoraWeb.APP_ID = process.env.AGORA_APP_ID;
        return FlatRTCAgoraWeb.getInstance();
    });

    flatServices.register("rtm", async () => {
        FlatRTMAgora.APP_ID = process.env.AGORA_APP_ID;
        return FlatRTMAgora.getInstance();
    });
}
