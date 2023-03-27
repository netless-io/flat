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

// cspell:disable
const FLAT_ELECTRON_DEV = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8G3P2T2DBF"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-8G3P2T2DBF');
    </script>
`;

const FLAT_ELECTRON_PROD = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-1VSFBNGGCC"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-1VSFBNGGCC');
    </script>
`;
// cspell:enable

const gtag = (isProduction: boolean): string => {
    return isProduction ? FLAT_ELECTRON_PROD : FLAT_ELECTRON_DEV;
};
