import en from "flat-i18n/en.json";
import zhCN from "flat-i18n/zh-CN.json";
import i18next, { Resource } from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const messages: Resource = {
    // @TODO wait until en translation completes
    en: { translation: en },
    "zh-CN": { translation: zhCN },
};

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
