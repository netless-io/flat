import { Plugin } from "esbuild";
import copy_, { CopyOptions } from "rollup-plugin-copy";

export default function copy(options?: CopyOptions): Plugin {
    const rawCopyPlugin = copy_(options) as { buildEnd: () => Promise<void> };
    return {
        name: "copy",
        setup({ onEnd }) {
            onEnd(() => rawCopyPlugin.buildEnd());
        },
    };
}
