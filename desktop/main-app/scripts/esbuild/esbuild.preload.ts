import esbuild, { BuildIncremental, Metafile } from "esbuild";
import { esbuildOption } from "./esbuild.common";
import * as paths from "./paths";

type BuildPreLoadDevType = () => Promise<BuildIncremental>;

export const buildPreLoadDev: BuildPreLoadDevType = () =>
    esbuild.build({
        ...esbuildOption,
        entryPoints: [paths.preloadPath],
        platform: "neutral",
        outfile: paths.preloadDist,
    });

type BuildPreLoadProdType = () => Promise<BuildIncremental & { metafile: Metafile }>;

export const buildPreLoadProd: BuildPreLoadProdType = () => {
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
