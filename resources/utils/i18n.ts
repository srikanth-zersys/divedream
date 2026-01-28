
import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationAr from "../js/json/lang/ar.json";
import translationDe from "../js/json/lang/de.json";
import translationEn from '../js/json/lang/en.json';
import translationEs from "../js/json/lang/es.json";
import translationFr from "../js/json/lang/fr.json";
import translationHe from "../js/json/lang/he.json";
import translationIt from "../js/json/lang/it.json";
import translationKo from "../js/json/lang/ko.json";
import translationNl from "../js/json/lang/nl.json";
import translationPt from "../js/json/lang/pt.json";
import translationRu from "../js/json/lang/ru.json";
import translationTr from "../js/json/lang/tr.json";
import translationVi from "../js/json/lang/vi.json";
import translationZh from "../js/json/lang/zh.json";

const resources = {
  en: { translation: translationEn },
  es: { translation: translationEs },
  fr: { translation: translationFr },
  ru: { translation: translationRu },
  de: { translation: translationDe },
  it: { translation: translationIt },
  zh: { translation: translationZh },
  ar: { translation: translationAr },
  tr: { translation: translationTr },
  he: { translation: translationHe },
  vi: { translation: translationVi },
  nl: { translation: translationNl },
  ko: { translation: translationKo },
  pt: { translation: translationPt },
};


i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    // lng: localStorage.getItem("I18N_LANGUAGE") || "en",
    fallbackLng: "en",
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });
export default i18n;


