import { getTemplate } from "../utils";

const electronCode = getTemplate("./template/electron.template.js");
const eventsCode = getTemplate("./template/events.template.js");
const fsExtraCode = getTemplate("./template/fs-extra.template.js");
const extractZipCode = getTemplate("./template/extract-zip.template.js");

export const options = [
    {
        entryPoints: "electron/index.js",
        code: electronCode,
        shouldBundle: false,
    },
    {
        entryPoints: "events/events.js",
        code: eventsCode,
        shouldBundle: false,
    },
    {
        entryPoints: "fs-extra/lib/index.js",
        code: fsExtraCode,
        shouldBundle: true,
    },
    {
        entryPoints: "extract-zip/index.js",
        code: extractZipCode,
        shouldBundle: true,
    },
];
