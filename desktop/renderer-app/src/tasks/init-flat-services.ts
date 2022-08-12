import { FlatServiceProviderFile, FlatServices, Toaster } from "@netless/flat-services";
import type { AgoraRTCElectron } from "@netless/flat-service-provider-agora-rtc-electron";
import { FlatI18n } from "@netless/flat-i18n";
import { Remitter } from "remitter";
import { message } from "antd";

export function initFlatServices(): void {
    const toaster = createToaster();
    const flatI18n = FlatI18n.getInstance();
    const flatServices = FlatServices.getInstance();

    flatServices.register(
        "file",
        async () => new FlatServiceProviderFile(flatServices, toaster, flatI18n),
    );

    flatServices.register("videoChat", async () => {
        const { AgoraRTCElectron } = await import(
            "@netless/flat-service-provider-agora-rtc-electron"
        );

        const agoraRtcSDK$ = (window as any).agoraRtcSDK$;
        if (!agoraRtcSDK$) {
            throw new Error("Missing agora rtc electron sdk global");
        }

        return new Promise(resolve => {
            let instance: AgoraRTCElectron | undefined;
            agoraRtcSDK$.subscribe((rtcEngine: any) => {
                if (rtcEngine) {
                    if (instance) {
                        instance.setRTCEngine(rtcEngine);
                    } else {
                        instance = new AgoraRTCElectron({
                            APP_ID: process.env.AGORA_APP_ID,
                            rtcEngine,
                        });
                        resolve(instance);
                    }
                }
            });
        });
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
            flatI18n,
            flatInfo: {
                platform: "electron",
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
