import "./style.css";

import { StaticDocsViewer } from "../src/static-docs-viewer";
import { Region } from "@netless/flat-server-api";

const viewer = new StaticDocsViewer(Region.CN_HZ);
viewer.pages$.setValue([
    {
        height: 1010,
        src: "https://convertcdn.netless.link/staticConvert/18140800fe8a11eb8cb787b1c376634e/1.png",
        width: 714,
    },
    {
        height: 1010,
        src: "https://convertcdn.netless.link/staticConvert/18140800fe8a11eb8cb787b1c376634e/2.png",
        width: 714,
    },
]);
document.body.appendChild(viewer.$docsViewer);
