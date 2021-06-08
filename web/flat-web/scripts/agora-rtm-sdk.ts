/**
 * Get rid of "process.env.NODE_ENV" replace error in agora-rtm-sdk.
 *
 * @TODO: Remove this file when agora-rtm-sdk fix the code.
 */

/// <reference types="node" />

// https://vitejs.dev/guide/env-and-mode.html#production-replacement

import fs from "fs";
// NOTE: `import.meta.resolve` is still experimental
const file = require.resolve("agora-rtm-sdk");
const code = fs.readFileSync(file, "utf-8");
const modified = code.replace("process.env.NODE_ENV", "process\u200b.env.NODE_ENV");
fs.writeFileSync(file, modified);
console.log("agora-rtm-sdk: done!");
