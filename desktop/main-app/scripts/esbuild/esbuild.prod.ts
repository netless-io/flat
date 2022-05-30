import esbuild from "esbuild";
import { esbuildOption } from "./esbuild.common";
import { buildPreLoadProd } from "./esbuild.preload";

(async () => {
    const result = await esbuild.build({
        ...esbuildOption,
        watch: false,
        bundle: true,
        minify: true,
        metafile: true,
        define: {
            "process.env.NODE_ENV": "'production'",
        },
    });
    const preloadRes = await buildPreLoadProd();
    const text = await esbuild.analyzeMetafile(result.metafile);
    const preloadText = await esbuild.analyzeMetafile(preloadRes.metafile);
    console.log(text);
    console.log(preloadText);
    process.exit(0);
})();
