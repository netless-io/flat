import esbuild from "esbuild";
import { esbuildOption } from "./esbuild.common";
import { buildPreLoadProd } from "./esbuild.preload";

(async () => {
    await esbuild.build({
        ...esbuildOption,
        watch: false,
        bundle: true,
        minify: true,
    });
    await buildPreLoadProd();
    process.exit(0);
})();
