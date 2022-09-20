/**
 * https://github.com/bvaughn/react-virtualized/issues/1212
 *
 * @TODO: Remove this file when react-virtualized fix the code.
 */
const fs = require("fs");
const path = require("path");

// eslint-disable-next-line @typescript-eslint/quotes
const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

/** @return {import('vite').PluginOption} */
exports.reactVirtualized = function reactVirtualized() {
    return {
        name: "flat:react-virtualized",
        // Note: we cannot use the `transform` hook here
        //       because libraries are pre-bundled in vite directly,
        //       plugins aren't able to hack that step currently.
        //       so instead we manually edit the file in node_modules.
        //       all we need is to find the timing before pre-bundling.
        configResolved() {
            const file = require
                .resolve("react-virtualized")
                .replace(
                    path.join("dist", "commonjs", "index.js"),
                    path.join("dist", "es", "WindowScroller", "utils", "onScroll.js"),
                );
            const code = fs.readFileSync(file, "utf-8");
            const modified = code.replace(WRONG_CODE, "");
            fs.writeFileSync(file, modified);
        },
    };
};
