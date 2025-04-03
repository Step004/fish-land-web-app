import { I18n } from "i18n-js";
import { translations as ukTranslations } from "../locales/uk";
import { translations as enTranslations } from "../locales/en";

const i18nInstance = new I18n({
  uk: ukTranslations,
  en: enTranslations,
});

// Функція для отримання мови з localStorage
const getSavedLanguage = () => {
  return localStorage.getItem("userLanguage") || "uk";
};

// Функція для збереження мови в localStorage
const saveLanguage = (language) => {
  localStorage.setItem("userLanguage", language);
};

// Встановлюємо початкову мову з localStorage
i18nInstance.locale = getSavedLanguage();
i18nInstance.defaultLocale = "uk";
i18nInstance.enableFallback = true;

// Створюємо об'єкт i18n з потрібними методами
export const i18n = {
  t: (key, options) => i18nInstance.t(key, options),
  setLanguage: (language) => {
    i18nInstance.locale = language;
    saveLanguage(language);
    // Викликаємо подію для оновлення компонентів
    window.dispatchEvent(new Event("languageChange"));
  },
  getCurrentLanguage: () => {
    return i18nInstance.locale;
  },
};
