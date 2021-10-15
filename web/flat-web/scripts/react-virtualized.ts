/**
 * https://github.com/bvaughn/react-virtualized/issues/1212
 *
 * @TODO: Remove this file when react-virtualized fix the code.
 */

/// <reference types="node" />

import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/quotes
const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

const file = require
    .resolve("react-virtualized")
    .replace(
        path.join("dist", "commonjs", "index.js"),
        path.join("dist", "es", "WindowScroller", "utils", "onScroll.js"),
    );
const code = fs.readFileSync(file, "utf-8");
const modified = code.replace(WRONG_CODE, "");
fs.writeFileSync(file, modified);
console.log("react-virtualized: done!");
