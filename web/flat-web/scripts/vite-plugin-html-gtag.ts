import type { Plugin } from "vite";

export function injectGtag(): Plugin {
    let isProduction = false;
    return {
        name: "flat:gtag",
        enforce: "pre",
        configResolved(config) {
            isProduction = config.isProduction;
        },
        transformIndexHtml: {
            enforce: "pre",
            transform(originalHTML) {
                const html = originalHTML.replace("<!-- FLAG_GTAG -->", gtag(isProduction));

                return {
                    html,
                    tags: [],
                };
            },
        },
    };
}

const FLAT_WEB_DEV = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-PYZ1K39HMD"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-PYZ1K39HMD');
    </script>
`;

const gtag = (isProduction: boolean): string => {
    return isProduction ? "" : FLAT_WEB_DEV;
};
