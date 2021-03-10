import { session } from "electron";
import fs from "fs-extra";
import path from "path";
import runtime from "../utils/Runtime";

export default () => {
    const filter = {
        urls: ["https://convertcdn.netless.link/*"],
    };

    session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
        const p = details.url.replace("https://convertcdn.netless.link/", "");
        const localPath = path.join(runtime.downloadsDirectory, p);

        // 如果文件存在，则替换原有请求，使用本地资源进行加载
        if (fs.existsSync(localPath)) {
            callback({
                // 这里需要注意的是，直接使用 file 协议进行重定向，请求时会报错
                // 所以需要在 webPreferences 里设置 webSecurity 为 false
                redirectURL: `file://${localPath}`,
            });
        } else {
            callback({});
        }
    });
};
