setImmediate(() => {
    const fixJQueryHosts = ["open.weixin.qq.com"];

    document.addEventListener("DOMNodeInserted", function DOMNodeInserted() {
        if (!window || !location.protocol) {
            return;
        }

        if (fixJQueryHosts.includes(location.host) && !window.$) {
            // @ts-ignore
            window.$ = window.jQuery = require("jquery");
        }

        if (
            (location.protocol === "file:" &&
                location.pathname.endsWith("static/render/index.html")) ||
            location.hostname === "localhost" ||
            location.hostname === "127.0.0.1"
        ) {
            // @ts-ignore
            window.AgoraRtcEngine = require("agora-electron-sdk").default;

            window.rtcEngine = new window.AgoraRtcEngine();
            window.rtcEngine.initialize(process.env.AGORA_APP_ID);
        }

        document.removeEventListener("DOMNodeInserted", DOMNodeInserted);
    });
});
