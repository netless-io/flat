import "../src/theme/custom-bulma.scss";
import "tachyons/css/tachyons.min.css";

import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";
import { addons } from "@storybook/addons";
import { UPDATE_GLOBALS } from "@storybook/core-events";
import { FlatThemeBodyProvider, useDarkMode } from "../src/components/FlatThemeProvider";
import { AntdProvider } from "../src/theme/antd.mod";
import { useEffect } from "react";
import { get } from "lodash-es";
import { FlatI18n, useLanguage } from "@netless/flat-i18n";

document.body.classList.add("flat-colors-root");

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
                name: "White",
                value: "#fff",
            },
            {
                name: "Homepage Background",
                value: "var(--grey-0)",
            },
            {
                name: "Homepage Dark Background",
                value: "var(--grey-12)",
            },
        ],
    },
    i18n: FlatI18n.getInstance().i18n,
    locale: "en",
    locales: {
        en: {
            right: "🇺🇸",
            title: "English",
        },
        "zh-CN": {
            right: "🇨🇳",
            title: "中文",
        },
    },
    viewport: {
        viewports: {
            ...MINIMAL_VIEWPORTS,
            tablet2: {
                name: "Large Tablet",
                styles: { width: "659px", height: "1000px" },
            },
            flatDesktop: {
                name: "Flat Desktop",
                styles: { width: "960px", height: "640px" },
            },
        },
    },
};

export const decorators = [
    (Story, context) => {
        const language = useLanguage();
        return <AntdProvider lang={language}>{Story(context)}</AntdProvider>;
    },
    (Story, context) => {
        const channel = addons.getChannel();
        const darkMode = useDarkMode(context.globals.prefersColorScheme);
        useEffect(() => {
            const bgColor = darkMode
                ? "var(--grey-12)"
                : get(context, ["parameters", "backgrounds", "default"], "#fff");

            document.querySelectorAll(".flat-theme-root").forEach(el => {
                el.style.backgroundColor = bgColor;
            });

            channel.emit(UPDATE_GLOBALS, {
                globals: {
                    backgrounds: {
                        value: bgColor,
                    },
                },
            });
        }, [darkMode]);
        return (
            <FlatThemeBodyProvider prefersColorScheme={context.globals.prefersColorScheme}>
                {Story(context)}
            </FlatThemeBodyProvider>
        );
    },
];

export const globalTypes = {
    prefersColorScheme: {
        name: "Prefers Color Scheme",
        description: "Prefers Color Scheme",
        defaultValue: "auto",
        toolbar: {
            icon: "paintbrush",
            items: ["auto", "light", "dark"],
        },
    },
};
