const fixJQueryHosts = ["open.weixin.qq.com"];

if (fixJQueryHosts.includes(location.host)) {
    document.addEventListener("DOMNodeInserted", function fixJQuery() {
        if (window && !window.$) {
            window.$ = window.jQuery = require("jquery");
            document.removeEventListener("DOMNodeInserted", fixJQuery);
        }
    });
}

if (
    (location.protocol === "file:" && location.pathname.endsWith("static/render/index.html")) ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
) {
    document.addEventListener("DOMNodeInserted", function injectionAgoraAddon() {
        if (window) {
            window.AgoraRtcEngine = require("agora-electron-sdk").default;
            document.removeEventListener("DOMNodeInserted", injectionAgoraAddon);
        }
    });
}
