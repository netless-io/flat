declare module "*.svg" {
    // eslint-disable-next-line no-undef
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}

declare module "*.json" {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module "*.mp3";

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production";
        DEV: boolean;
        PROD: boolean;
        VERSION: string;

        FLAT_SERVER_DOMAIN: string;
        FLAT_WEB_DOMAIN: string;

        FLAT_DOWNLOAD_URL: string;
        FEEDBACK_URL: string;

        CLOUD_RECORDING_DEFAULT_AVATAR?: string;

        FLAT_REGION: "CN" | "SG";
        LOGIN_METHODS: string;
    }
}

interface PortalWindow extends Window {
    browserWindowID: string;
}

interface Window {
    __netlessUA?: string;
    electron: {
        ipcRenderer: {
            on: (
                channel: string,
                listeners: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
            ) => Electron.IpcRenderer;
            send: (channel: string, ...args: any[]) => void;
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            removeAllListeners: (channel: string) => Electron.IpcRenderer;
        };
        shell: {
            openExternal: (
                url: string,
                options?: Electron.OpenExternalOptions | undefined,
            ) => Promise<void>;
        };
    };
    node: {
        os: {
            cpus: () => os.CpuInfo[];
            freemem: () => number;
            platform: () => NodeJS.Platform;
        };
        path: {
            join: (...paths: string[]) => string;
            dirname: (p: string) => string;
            basename: (p: string, ext?: string | undefined) => string;
        };
    };
    isElectron?: boolean;
}
