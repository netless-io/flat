import "../theme/index.less";
import "./custom-bulma.scss";
import "tachyons/css/tachyons.min.css";

import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
        expanded: true,
        hideNoControlsWarning: true,
    },
    backgrounds: {
        values: [
            {
                name: "Homepage Background",
                value: "#F3F6F9",
            },
        ],
    },
    viewport: {
        viewports: {
            ...MINIMAL_VIEWPORTS,
            tablet2: {
                name: "Large Tablet",
                styles: { width: "659px", height: "1000px" },
            },
        },
    },
};
