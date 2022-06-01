import esbuild, { BuildIncremental } from "esbuild";
import { esbuildOption } from "./esbuild.common";
import * as paths from "./paths";

type BuildPreLoadType = () => Promise<BuildIncremental>;

export const buildPreLoadDev: BuildPreLoadType = () =>
    esbuild.build({
        ...esbuildOption,
        entryPoints: [paths.preloadPath],
        platform: "neutral",
        outfile: paths.preloadDist,
    });

export const buildPreLoadProd: BuildPreLoadType = () => {
    return esbuild.build({
        ...esbuildOption,
        entryPoints: [paths.preloadPath],
        platform: "neutral",
        outfile: paths.preloadDist,
        watch: false,
        bundle: true,
        minify: true,
        metafile: true,
    });
};
