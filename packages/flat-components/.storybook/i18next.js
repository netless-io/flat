import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from "flat-i18n/en.json";
import zhCN from "flat-i18n/zh-CN.json";

const messages = {
    en: { translation: en },
    "zh-CN": { translation: zhCN },
};

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: messages,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export const i18n = i18next;

export const languages = ["en", "zh-CN"];

export const languagesWithName = [
    { lang: "en", name: "English" },
    { lang: "zh-CN", name: "简体中文" },
];