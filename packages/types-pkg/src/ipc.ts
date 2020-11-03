import * as runtime from "./runtime";

export type ActionAsync = {
    "set-win-size": (args: { width: number; height: number; autoCenter?: boolean }) => void;
};

export type ActionSync = {
    "get-runtime": () => runtime.Type;
};
