"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { languages, DEFAULT_LANGUAGE } from "../i18n/languages";
import { translations } from "../i18n/translations";
import { productTranslations } from "../i18n/productTranslations";
import { categoryTranslations } from "../i18n/categoryTranslations";

const LanguageContext = createContext();

const STORAGE_KEY = "venus_green_language";

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from localStorage on client mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && languages.some((l) => l.code === savedLang)) {
        setCurrentLanguage(savedLang);
      }
    } catch (e) {
      console.warn("Could not load language from localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  // Change language and persist to localStorage
  const setLanguage = (langCode) => {
    if (languages.some((l) => l.code === langCode)) {
      setCurrentLanguage(langCode);
      try {
        localStorage.setItem(STORAGE_KEY, langCode);
      } catch (e) {
        console.warn("Could not save language to localStorage", e);
      }
    }
  };

  /**
   * Helper function to get translated text with dot-notation path
   * Example: t("nav.home") or t("cartDrawer.addMoreForFreeShipping", { amount: 50 })
   */
  const t = (path, params = {}) => {
    const keys = path.split(".");
    
    // 1. Try current language
    let result = translations[currentLanguage];
    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key];
      } else {
        result = null;
        break;
      }
    }

    // 2. Fallback to English if not found
    if (!result && currentLanguage !== DEFAULT_LANGUAGE) {
      let fallback = translations[DEFAULT_LANGUAGE];
      for (const key of keys) {
        if (fallback && typeof fallback === "object" && key in fallback) {
          fallback = fallback[key];
        } else {
          fallback = null;
          break;
        }
      }
      result = fallback;
    }

    // 3. Fallback to path itself if not found
    if (typeof result !== "string") {
      return path;
    }

    // 4. Interpolate variables like {name}, {amount}, {orderId}
    if (params && typeof params === "object") {
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), params[paramKey]);
      });
    }

    return result;
  };

  /**
   * Helper function to get translated product object
   */
  const getTranslatedProduct = (product) => {
    if (!product) return product;

    const prodTranslation = productTranslations[product.id];
    if (!prodTranslation) return product;

    const localizedName =
      prodTranslation.names[currentLanguage] ||
      prodTranslation.names[DEFAULT_LANGUAGE] ||
      product.name;

    const localizedShortDesc =
      prodTranslation.shortDescriptions[currentLanguage] ||
      prodTranslation.shortDescriptions[DEFAULT_LANGUAGE] ||
      product.shortDescription;

    return {
      ...product,
      name: localizedName,
      shortDescription: localizedShortDesc,
      originalEnglishName: product.name,
    };
  };

  /**
   * Helper function to get translated category object
   */
  const getTranslatedCategory = (category) => {
    if (!category) return category;

    const catTranslation = categoryTranslations[category.id];
    if (!catTranslation) return category;

    const localizedName =
      catTranslation.names[currentLanguage] ||
      catTranslation.names[DEFAULT_LANGUAGE] ||
      category.name;

    const localizedDesc =
      catTranslation.descriptions[currentLanguage] ||
      catTranslation.descriptions[DEFAULT_LANGUAGE] ||
      category.description;

    const localizedBadge =
      catTranslation.badges[currentLanguage] ||
      catTranslation.badges[DEFAULT_LANGUAGE] ||
      category.badge;

    return {
      ...category,
      name: localizedName,
      description: localizedDesc,
      badge: localizedBadge,
      originalEnglishName: category.name,
    };
  };

  const activeLanguageMeta =
    languages.find((l) => l.code === currentLanguage) || languages[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        languages,
        activeLanguageMeta,
        t,
        getTranslatedProduct,
        getTranslatedCategory,
        isInitialized,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
