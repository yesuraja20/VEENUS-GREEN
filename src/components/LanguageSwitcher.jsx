"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";

export default function LanguageSwitcher({ isMobile = false }) {
  const { currentLanguage, setLanguage, languages, activeLanguageMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-gold-400">
          <Globe className="w-4 h-4" />
          <span>Select Language / மொழி</span>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {languages.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`py-2 px-3 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                  isSelected
                    ? "bg-gold-500/20 text-gold-300 border border-gold-400/40 font-bold"
                    : "bg-forest-800/80 text-cream-200 border border-forest-700/60 hover:bg-forest-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-cream-50">{lang.nativeName}</span>
                  <span className="text-[10px] text-cream-400">{lang.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select website language"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-800/90 hover:bg-forest-750 border border-gold-500/30 text-cream-100 text-xs font-medium tracking-wide shadow-sm hover:border-gold-400 transition-all duration-200 group"
      >
        <Globe className="w-3.5 h-3.5 text-gold-400 group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-cream-50">
          {activeLanguageMeta.nativeName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gold-400/80 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-forest-900 border border-gold-500/30 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-lg">
          <div className="px-3 py-2 border-b border-forest-800/80 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold-400">
              Languages / மொழிகள்
            </p>
            <p className="text-[10px] text-cream-400 mt-0.5">
              Choose your preferred regional language
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {languages.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-gold-500/20 text-gold-300 border border-gold-400/40"
                      : "text-cream-200 hover:bg-forest-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${
                          isSelected ? "font-bold text-gold-200" : "font-semibold text-cream-100"
                        }`}
                      >
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] text-cream-400">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-gold-500/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-gold-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
