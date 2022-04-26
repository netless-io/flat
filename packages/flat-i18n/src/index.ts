import i18next, { Resource } from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import zhCN from "../locales/zh-CN.json";

import varsCNen from "../vars/cn/en.json";
import varsCNzhCN from "../vars/cn/zh-CN.json";
import varsUSen from "../vars/us/en.json";
import varsUSzhCN from "../vars/us/zh-CN.json";

/**
 * NOTE: to use this library, also install https://github.com/antfu/i18n-ally
 * to edit translations. open a new vscode window at <path to renderer-app>.
 */

export let i18nLoaded = false;

export const i18n = i18next;

export const languages = ["en", "zh-CN"] as const;

export async function initI18n(): Promise<void> {
    if (i18nLoaded) {
        return;
    }

    const messages: Resource = {
        en: { translation: en },
        "zh-CN": { translation: zhCN },
    };

    const defaultVars: Record<string, Record<string, string>> = process.env.FLAT_REGION === "US"
        ? { en: varsUSen, "zh-CN": varsUSzhCN }
        : { en: varsCNen, "zh-CN": varsCNzhCN };

    const p = i18next
        .use(I18nextBrowserLanguageDetector)
        .use(initReactI18next)
        .init({
            resources: messages,
            fallbackLng: "en",
            supportedLngs: languages,
            interpolation: {
                escapeValue: false, // react already safes from xss
                defaultVariables: defaultVars[i18next.language] || defaultVars.en,
            },
        });

    const changeLang = (lang: string): void => {
        document.querySelector("html")?.setAttribute("lang", lang);

        const defaultVariables = defaultVars[lang] || defaultVars.en;
        if (i18next.options.interpolation) {
            i18next.options.interpolation.defaultVariables = defaultVariables;
        } else {
            i18next.options.interpolation = { defaultVariables };
        }
    };

    changeLang(i18next.language);
    i18next.on("languageChanged", changeLang);

    await p;

    i18nLoaded = true;
}
