import { protocol, session } from "electron";
import fs from "fs-extra";
import path from "path";
import runtime from "../utils/Runtime";

export default () => {
    // electron 9 版本之后，下面的代码必须加上，否则因为 electron 无法处理 file 协议而导致 预加载失效
    // 详情可见: https://github.com/electron/electron/issues/23757
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
