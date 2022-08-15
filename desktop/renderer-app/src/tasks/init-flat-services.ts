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
        const { Fastboard, register } = await import("@netless/flat-service-provider-fastboard");
        void register({
            kind: "Monaco",
            appOptions: {
                loader: {
                    paths: {
                        vs: getVSPath(),
                    },
                },
            },
            src: () => import("@netless/app-monaco"),
        });
        void register({
            kind: "Countdown",
            src: () => import("@netless/app-countdown"),
        });
        void register({
            kind: "GeoGebra",
            src: async () => import("@netless/app-geogebra"),
            appOptions: {
                // TODO: replace it with non-country specific url
                HTML5Codebase:
                    "https://flat-storage-cn-hz.whiteboard.agora.io/GeoGebra/HTML5/5.0/web3d",
            },
        });
        void register({
            kind: "IframeBridge",
            src: () => import("@netless/app-iframe-bridge"),
        });

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

    flatServices.register(
        [
            "file-convert:doc",
            "file-convert:docx",
            "file-convert:ppt",
            "file-convert:pptx",
            "file-convert:pdf",
        ],
        async () => {
            const { FileConvertNetless } = await import(
                "@netless/flat-service-provider-file-convert-netless"
            );
            return new FileConvertNetless();
        },
    );

    flatServices.register("file-convert:ice", async () => {
        const { FileConvertH5 } = await import("@netless/flat-service-provider-file-convert-h5");
        return new FileConvertH5();
    });

    flatServices.register(
        [
            "file-insert:jpg",
            "file-insert:jpeg",
            "file-insert:png",
            "file-insert:webp",
            "file-insert:mp3",
            "file-insert:mp4",
            "file-insert:doc",
            "file-insert:docx",
            "file-insert:ppt",
            "file-insert:pptx",
            "file-insert:pdf",
            "file-insert:ice",
            "file-insert:vf",
        ],
        async () => {
            if (flatServices.isCreated("whiteboard")) {
                const { Fastboard } = await import("@netless/flat-service-provider-fastboard");
                const service = await flatServices.requestService("whiteboard");
                if (service instanceof Fastboard) {
                    return { insert: file => service.insert(file) };
                }
            }
            return null;
        },
    );
}

function createToaster(): Toaster {
    const toaster: Toaster = new Remitter();
    toaster.on("info", info => message.info(info));
    toaster.on("error", error => message.error(error));
    toaster.on("warn", warn => message.warn(warn));
    return toaster;
}

const getVSPath = (): string => {
    let vsPath;
    if (process.env.NODE_ENV === "production") {
        vsPath = window.node.path.join(__dirname, "monaco-editor", "min", "vs");
    } else {
        const nodeModulesName = "node_modules";
        const nodeModulesEndIndexByPath =
            __dirname.indexOf(nodeModulesName) + nodeModulesName.length;

        const rootNodeModulesPath = __dirname.slice(0, nodeModulesEndIndexByPath);

        vsPath = window.node.path.join(rootNodeModulesPath, "monaco-editor", "min", "vs");
    }

    return `file:///${vsPath.replace(/\\/g, "/")}`;
};
