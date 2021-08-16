import i18next from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "flat-i18n/locales/en.json";
import zhCN from "flat-i18n/locales/zh-CN.json";

const messages = {
    en: { translation: en },
    "zh-CN": { translation: zhCN },
};

i18next
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        resources: messages,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

/**
 * i18next 实例
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

export const languages = ["en", "zh-CN"];

export const languagesWithName = [
    { lang: "en", name: "English" },
    { lang: "zh-CN", name: "简体中文" },
];

/**
 * NOTE: to use this library, also install https://github.com/antfu/i18n-ally
 * to edit translations. open a new vscode window at <path to renderer-app>.
 */
