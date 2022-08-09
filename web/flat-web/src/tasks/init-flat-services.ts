import { FlatI18n } from "@netless/flat-i18n";
import { FlatServices, Toaster } from "@netless/flat-services";
import { message } from "antd";
import { Remitter } from "remitter";

export function initFlatServices(): void {
    const flatServices = FlatServices.getInstance();
    const toaster = createToaster();

    flatServices.register("videoChat", async () => {
        const { AgoraRTCWeb } = await import("@netless/flat-service-provider-agora-rtc-web");
        return new AgoraRTCWeb({ APP_ID: process.env.AGORA_APP_ID });
    });

    flatServices.register("textChat", async () => {
        const { AgoraRTM } = await import("@netless/flat-service-provider-agora-rtm");
        AgoraRTM.APP_ID = process.env.AGORA_APP_ID;
        return AgoraRTM.getInstance();
    });

    flatServices.register("whiteboard", async () => {
        const { Fastboard } = await import("@netless/flat-service-provider-fastboard");
        return new Fastboard({
            APP_ID: process.env.NETLESS_APP_IDENTIFIER,
            toaster,
            flatI18n: FlatI18n.getInstance(),
            flatInfo: {
                platform: "web",
                ua: process.env.FLAT_UA,
                region: process.env.FLAT_REGION,
                version: process.env.VERSION,
            },
        });
    });
}

function createToaster(): Toaster {
    const toaster: Toaster = new Remitter();
    toaster.on("info", info => message.info(info));
    toaster.on("error", error => message.error(error));
    toaster.on("warn", warn => message.warn(warn));
    return toaster;
}
