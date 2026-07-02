import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ar from "./locales/ar.json";
import he from "./locales/he.json";

const savedLang = localStorage.getItem("i18n_lang") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    he: { translation: he },
  },
  lng: savedLang,
  fallbackLng: "en",
  supportedLngs: ["en", "ar", "he"],
  interpolation: { escapeValue: false },
});

const applyDirection = (lang) => {
  const dir = ["ar", "he"].includes(lang) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  localStorage.setItem("i18n_lang", lang);
};

applyDirection(savedLang);
i18n.on("languageChanged", applyDirection);

export default i18n;
