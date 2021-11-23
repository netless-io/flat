import { protocol, session } from "electron";
import fs from "fs-extra";
import path from "path";
import runtime from "../utils/runtime";

export default (): void => {
    // see: https://github.com/electron/electron/issues/23757
    protocol.registerFileProtocol("file", (request, callback) => {
        const pathname = decodeURI(request.url.replace("file:///", ""));
        callback(pathname);
    });

    const filter = {
        urls: [
            "https://convertcdn.netless.link/*",
            "https://convertcdn-us-sv.netless.link/*",
            "https://convertcdn-gb-lon.netless.link/*",
            "https://convertcdn-sg.netless.link/*",
            "https://convertcdn-in-mum.netless.link/*",
        ],
    };

    session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
        const p = details.url.replace(/^https:\/\/convertcdn\S*\.netless\.link\//, "");
        const localPath = path.join(runtime.downloadsDirectory, p);

        if (fs.existsSync(localPath)) {
            callback({
                redirectURL: `file://${localPath}`,
            });
        } else {
            callback({});
        }
    });
};
