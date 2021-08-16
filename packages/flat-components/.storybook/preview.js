import "../theme/index.less";
import "./custom-bulma.scss";
import "tachyons/css/tachyons.min.css";

import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";
import { i18n } from "./i18n";

export const globalTypes = {
    locale: {
        name: "Locale",
        description: "Internationalization locale",
        defaultValue: "en",
        toolbar: {
            icon: "globe",
            items: [
                { value: "en", right: "🇺🇸", title: "English" },
                { value: "zh-CN", right: "🇨🇳", title: "中文" },
            ],
        },
    },
};

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

export const decorators = [
    function I18nDecorator(Story, context) {
        useEffect(() => {
            i18n.changeLanguage(context.globals.locale);
        }, [context.globals.locale]);
        return (
            <I18nextProvider i18n={i18n}>
                <Story />
            </I18nextProvider>
        );
    },
];
