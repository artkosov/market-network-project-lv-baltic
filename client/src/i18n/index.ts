import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import lv from "./locales/lv";
import en from "./locales/en";
import ru from "./locales/ru";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      lv: { translation: lv },
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: "lv",
    defaultNS: "translation",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
export const languages = [
  { code: "lv", label: "LV", name: "Latviešu", flag: "🇱🇻" },
  { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  { code: "ru", label: "RU", name: "Русский", flag: "🇷🇺" },
];
