import i18next, { Resource } from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "flat-i18n/locales/en.json";
import zhCN from "flat-i18n/locales/zh-CN.json";

import varsCNen from "flat-i18n/vars/cn/en.json";
import varsCNzhCN from "flat-i18n/vars/cn/zh-CN.json";
import varsUSen from "flat-i18n/vars/us/en.json";
import varsUSzhCN from "flat-i18n/vars/us/zh-CN.json";

const messages: Resource = {
    en: { translation: en },
    "zh-CN": { translation: zhCN },
};

const defaultVars: Record<string, Record<string, string>> = process.env.FLAT_REGION === "US"
    ? { en: varsUSen, "zh-CN": varsUSzhCN }
    : { en: varsCNen, "zh-CN": varsCNzhCN };

void i18next
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        load: "currentOnly",
        debug: process.env.NODE_ENV === "development",
        resources: messages,
        fallbackLng: "zh-CN",
        supportedLngs: ["zh-CN", "en"],
        interpolation: {
            escapeValue: false, // react already safes from xss
            defaultVariables: defaultVars[i18next.language] || defaultVars.en,
        },
    });

/**
 * ```tsx
 * // class component
 * import { withTranslation, WithTranslation } from 'react-i18next';
 * class App extends React.Component<WithTranslation> {
 *   render() { return <div>{this.props.t('hello')}</div> }
 * }
 * export default withTranslation()(App);
 * // function component
 * import { useTranslation } from "react-i18next";
 * function App() {
 *   const { t, i18n } = useTranslation();
 *   return <div>{t('hello')}</div>
 * }
 * ```
 */
export const i18n = i18next;

export const languages = ["en", "zh-CN"] as const;

/**
 * NOTE: to use this library, also install https://github.com/antfu/i18n-ally
 * to edit translations. open a new vscode window at <path to renderer-app>.
 */

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
