import i18next, { type Resource, type i18n as Ii18n } from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { ReadonlyVal, Val } from "value-enhancer";
import { SideEffectManager } from "side-effect-manager";
import en from "../locales/en.json";
import zhCN from "../locales/zh-CN.json";

import varsCNen from "../vars/cn/en.json";
import varsCNzhCN from "../vars/cn/zh-CN.json";
// import varsUSen from "../vars/us/en.json";
// import varsUSzhCN from "../vars/us/zh-CN.json";

/**
 * @param key - key of the translation
 * @param options - optional options for interpolation
 *
 * @example
 * i18n translation: { "hello": "Hello, {name}" }
 * tFunction("hello", { name: "John" })
 */
export type FlatI18nTFunction = (
    key: string,
    options?: Record<string, string | number | undefined>,
) => string;

export type FlatI18nLanguages = (typeof FlatI18n.languages)[number];

/**
 * NOTE: to use this library, also install https://github.com/antfu/i18n-ally
 * to edit translations. open a new vscode window at <path to renderer-app>.
 */

declare global {
    interface Window {
        __FlAtI18n?: FlatI18n;
    }
}

export class FlatI18n {
    public static t: FlatI18nTFunction = (key, options) =>
        FlatI18n.getInstance().i18n.t(key, options);

    public static changeLanguage = async (lang: FlatI18nLanguages): Promise<void> => {
        await FlatI18n.getInstance().i18n.changeLanguage(lang);
    };

    public static getInstance(): FlatI18n {
        return (window.__FlAtI18n ||= new FlatI18n());
    }

    public static readonly languages = ["en", "zh-CN"] as const;

    public readonly $Val: {
        readonly isReady$: ReadonlyVal<boolean>;
        readonly language$: ReadonlyVal<FlatI18nLanguages>;
    };

    public get isReady(): boolean {
        return this.$Val.isReady$.value;
    }

    public get language(): FlatI18nLanguages {
        return this.$Val.language$.value;
    }

    public t: FlatI18nTFunction = (key, options) => this.i18n.t(key, options);

    public changeLanguage = async (lang: FlatI18nLanguages): Promise<void> => {
        await this.i18n.changeLanguage(lang);
    };

    public readonly i18n: Ii18n;

    private _sideEffect = new SideEffectManager();

    private constructor() {
        const isReady$ = new Val(false);
        const language$ = new Val<FlatI18nLanguages>("en");
        this.$Val = { isReady$, language$ };

        this.i18n = i18next;

        const resources: Resource = {
            "en": { translation: en },
            "zh-CN": { translation: zhCN },
        };

        const defaultVars: Record<string, Record<string, string>> = {
            "en": varsCNen,
            "zh-CN": varsCNzhCN,
        };

        i18next
            .use(I18nextBrowserLanguageDetector)
            .init({
                resources,
                fallbackLng: "en",
                supportedLngs: FlatI18n.languages,
                interpolation: {
                    escapeValue: false, // react already safes from xss
                    defaultVariables: defaultVars[i18next.language] || defaultVars.en,
                },
            })
            .then(() => {
                language$.setValue(i18next.language as FlatI18nLanguages);
                isReady$.setValue(true);
            });

        const changeLang = (lang: FlatI18nLanguages): void => {
            document.querySelector("html")?.setAttribute("lang", lang);

            const defaultVariables = defaultVars[lang] || defaultVars.en;
            if (i18next.options.interpolation) {
                i18next.options.interpolation.defaultVariables = defaultVariables;
            } else {
                i18next.options.interpolation = { defaultVariables };
            }

            language$.setValue(lang);
        };

        changeLang(i18next.language as FlatI18nLanguages);

        i18next.on("languageChanged", changeLang);
        this._sideEffect.addDisposer(() => {
            i18next.off("languageChanged", changeLang);
        });
    }

    public destroy(): void {
        this._sideEffect.flushAll();
    }
}
