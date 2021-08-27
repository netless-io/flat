import type { Type as RuntimeType } from "../runtime";
import type { UpdateCheckInfo, PrereleaseTag } from "../update";

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
    }) => void;
    "set-aspect-ratio": (args: { aspectRatio: number }) => void;
    "disable-window": (args: { disable: boolean }) => void;
    "set-title": (args: { title: string }) => void;
    "set-prevent-sleep": (args: { enable: boolean }) => void;
    "start-update": (args: { prereleaseTag: PrereleaseTag }) => void;
    "cancel-update": () => void;
};

export type AppActionAsync = {
    "set-open-at-login": (args: { isOpenAtLogin: boolean }) => void;
};

export type AppActionSync = {
    "get-runtime": () => Promise<RuntimeType>;
    "get-open-at-login": () => Promise<boolean>;
    "get-update-info": () => Promise<UpdateCheckInfo>;
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
}
