/**
 * Create a umd module from white-web-sdk.
 *
 * @TODO: Remove this file when white-web-sdk supports umd.
 */

/// <reference types="node" />

// NOTE: now white-web-sdk's cjs version works, but we may want to
//       use the esm version (white-web-sdk-esm).
//       so this file is kept here to see if we need to hack again.
//       basic steps:
//       1. download https://cdn.jsdelivr.net/npm/white-web-sdk-esm@latest/index.mjs
//          save it to /node_modules/white-web-sdk/index.mjs
//       2. edit /node_modules/white-web-sdk/package.json
//          set "module" to "index.mjs"

export type {};
