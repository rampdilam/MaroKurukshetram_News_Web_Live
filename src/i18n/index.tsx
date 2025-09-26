import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import te from "../locales/te.json";
import ur from "../locales/ur.json";
import hi from "../locales/hi.json";
import ta from "../locales/ta.json";
import kn from "../locales/kn.json";

const languageCodeMap: Record<string, string> = {
  en: "en",
  te: "te",
  ka: "kn", // Kannada
  ud: "ur", // Urdu
  hi: "hi", // Hindi
  ta: "ta", // Tamil
};

export const normalizeLanguageCode = (code: string) => {
  const lower = code.toLowerCase();
  return languageCodeMap[lower] || lower;
};

export const getLanguageDirection = (langCode: string): "rtl" | "ltr" => {
  const rtlLanguages = ["ur", "ar", "he", "fa"];
  return rtlLanguages.includes(langCode) ? "rtl" : "ltr";
};

const resources = {
  en: { translation: en },
  te: { translation: te },
  ur: { translation: ur },
  hi: { translation: hi },
  ta: { translation: ta },
  kn: { translation: kn },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    debug: process.env.NODE_ENV === "development",
  });

// Always update document direction when language changes
i18n.on("languageChanged", (lng) => {
  const dir = getLanguageDirection(normalizeLanguageCode(lng));
  document.dir = dir;
});

// Run once on load
document.dir = getLanguageDirection(
  normalizeLanguageCode(i18n.language || "en")
);

export default i18n;

export const handleSaveLanguage = (
  selectedLanguage: { code: string } | null,
  setOpenLanguageDialog: (open: boolean) => void
) => {
  if (selectedLanguage) {
    const normalizedCode = normalizeLanguageCode(selectedLanguage.code);
    if (i18n.hasResourceBundle(normalizedCode, "translation")) {
      i18n.changeLanguage(normalizedCode);
      localStorage.setItem("i18nextLng", normalizedCode);
      setOpenLanguageDialog(false);
    } else {
      console.warn(`Language ${normalizedCode} not found in i18n resources`);
    }
  }
};