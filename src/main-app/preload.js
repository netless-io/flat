const fixJQueryHosts = ["open.weixin.qq.com"];

document.addEventListener("DOMNodeInserted", function DOMNodeInserted() {
    if (!window) {
        return;
    }

    if (fixJQueryHosts.includes(location.host) && !window.$) {
        window.$ = window.jQuery = require("jquery");
    }

    if (
        (location.protocol === "file:" && location.pathname.endsWith("static/render/index.html")) ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1"
    ) {
        window.AgoraRtcEngine = require("agora-electron-sdk").default;
    }

    document.removeEventListener("DOMNodeInserted", DOMNodeInserted);
});
