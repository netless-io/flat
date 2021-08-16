import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { i18n } from './i18next.js';

import "../src/theme/index.less";
import '../src/theme/custom-bulma.scss';
import "tachyons/css/tachyons.min.css";

export const parameters = {
  options: {
    showPanel: true,
  },
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
  i18n,
  locale: "en",
  locales: {
    "en": {
      right: "🇺🇸",
      title: "English",
    },
    "zh-CN": {
      right: "🇨🇳",
      title: "中文",
    }
  },
  viewport: {
    viewports: {
      ...MINIMAL_VIEWPORTS,
      tablet2: {
        name: "Large Tablet",
        styles: { width: "659px", height: "1000px" },
      },
    }
  },
}
