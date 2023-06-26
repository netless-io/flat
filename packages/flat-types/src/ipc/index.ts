import type { Type as RuntimeType } from "../runtime";
import type { UpdateCheckInfo, PrereleaseTag } from "../update";
import { WindowsName, WindowStatus } from "../constants";

export type WindowActionAsync = {
    "set-win-size": (args: {
        width: number;
        height: number;
        autoCenter?: boolean;
        resizable?: boolean;
        setMinimumSize?:
            | true
            | {
                  minWidth: number;
                  minHeight: number;
              };
        maximizable?: boolean;
        trafficLightPosition?: { x: number; y: number };
    }) => void;
    "set-aspect-ratio": (args: { aspectRatio: number }) => void;
    "intercept-native-window-close": (args: { intercept: boolean }) => void;
    "set-title": (args: { title: string }) => void;
    "force-close-window": (args: {}) => void;
    "set-visual-zoom-level": (args: { minimumLevel: number; maximumLevel: number }) => void;
    "set-win-status": (args: { windowStatus: WindowStatus }) => void;
    "set-theme": (args: { theme: "light" | "dark" | "auto" }) => void;
};

export type AppActionAsync = {
    "set-open-at-login": (args: { isOpenAtLogin: boolean }) => void;
    "set-prevent-sleep": (args: { enable: boolean }) => void;
    "start-update": (args: { prereleaseTag: PrereleaseTag }) => void;
    "cancel-update": () => void;
};

export type AppActionSync = {
    "get-runtime": () => Promise<RuntimeType>;
    "get-open-at-login": () => Promise<boolean>;
    "get-update-info": () => Promise<UpdateCheckInfo>;
    "can-create-window": (args: { windowName: WindowsName }) => Promise<boolean>;
};

export interface EmitEvents {
    "window-will-close": {};
    "update-progress":
        | {
              status: true;
              total: number;
              transferred: number;
              percent: number;
              bytesPerSecond: number;
          }
        | {
              status: false;
          };
    "request-join-room": {
        roomUUID: string;
    };
    "request-replay-room": {
        roomUUID: string;
        ownerUUID: string;
        roomType: string;
    };
}
