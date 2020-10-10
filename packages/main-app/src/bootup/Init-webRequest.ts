import { session } from "electron";
import fs from "fs-extra";
export default (context: Context) => {
    const filter = {
        urls: ["https://convertcdn.netless.link"],
    };

    session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
        const url = details.url;
        const path = url.split("/").splice(-5);
        const localPath = `${context.runtime.downloadsDirectory}/${path}`;

        if (fs.existsSync(localPath)) {
            callback({
                redirectURL: `${context.runtime.downloadsDirectory}/${path}`,
            });
        } else {
            callback({});
        }
    });
};
