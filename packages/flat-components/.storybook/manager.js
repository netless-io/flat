import { addons } from "@storybook/addons";
import flatTheme from "./flat-theme";
import "style-loader!css-loader!less-loader!../src/theme/colors.less";

document.body.classList.add("flat-theme-root");

addons.setConfig({
    theme: flatTheme,
});
