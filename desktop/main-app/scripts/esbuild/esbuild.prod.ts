import esbuild from "esbuild";
import { esbuildOption } from "./esbuild.common";

(async () => {
    const result = await esbuild.build({
        ...esbuildOption,
        watch: false,
        bundle: true,
        minify: true,
        metafile: true,
    });
    const text = await esbuild.analyzeMetafile(result.metafile);
    console.log(text);
    process.exit(0);
})();
