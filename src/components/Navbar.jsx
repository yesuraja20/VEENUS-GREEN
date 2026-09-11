"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "../config/siteConfig";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { generateWhatsAppInquiryUrl } from "../utils/whatsapp";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Leaf,
} from "lucide-react";

export default function Navbar({ onSearchFocus }) {
  const { totalItems, setIsCartOpen } = useCart();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchClick = () => {
    if (onSearchFocus) {
      onSearchFocus();
    } else {
      const searchElement = document.getElementById("product-search-input");
      if (searchElement) {
        searchElement.scrollIntoView({ behavior: "smooth", block: "center" });
        searchElement.focus();
      }
    }
  };

  const navLinks = [
    { name: t("nav.home"), href: "#hero" },
    { name: t("nav.about"), href: "#about" },
    { name: t("nav.categories"), href: "#categories" },
    { name: t("nav.products"), href: "#products" },
    { name: t("nav.whyChooseUs"), href: "#why-choose-us" },
    { name: t("nav.testimonials"), href: "#testimonials" },
    { name: t("nav.contact"), href: "#contact" },
  ];

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="bg-forest-950 text-gold-200 text-xs py-2 px-4 border-b border-gold-500/20 text-center font-medium tracking-wider flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
        <span>{t("announcement.freshHarvest")}</span>
        <span className="hidden md:inline-block text-forest-500">|</span>
        <a
          href={generateWhatsAppInquiryUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 font-semibold underline ml-1"
        >
          <MessageCircle className="w-3 h-3" /> {t("announcement.quickInquiry")}
        </a>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-forest-900/95 backdrop-blur-md shadow-luxury py-3 border-b border-gold-500/20"
            : "bg-forest-900 py-4 border-b border-forest-800/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="#hero" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center shadow-gold-glow/20 group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-5 h-5 text-forest-950" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-cream-50 group-hover:text-gold-300 transition-colors">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-widest text-gold-400/90 -mt-1">
                  Spices & Essentials
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-cream-100/90 hover:text-gold-300 text-sm font-medium tracking-wide transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gold-400 hover:after:w-full after:transition-all after:duration-300"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Language Switcher Dropdown */}
              <LanguageSwitcher />

              {/* Search Icon Trigger */}
              <button
                onClick={handleSearchClick}
                aria-label={t("nav.search")}
                className="p-2 sm:p-2.5 rounded-full text-cream-200 hover:text-gold-300 hover:bg-forest-800/80 transition-all"
                title={t("nav.search")}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Shopping Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label={t("nav.viewCart")}
                className="relative p-2 sm:p-2.5 rounded-full text-cream-100 hover:text-gold-300 hover:bg-forest-800/80 transition-all flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-forest-950 text-xs font-bold flex items-center justify-center shadow-gold-glow animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* WhatsApp Order Button */}
              <a
                href={generateWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/40 text-cream-50 text-xs font-semibold tracking-wide shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>{t("nav.whatsappOrder")}</span>
              </a>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="lg:hidden p-2 rounded-lg text-cream-200 hover:text-gold-300 hover:bg-forest-800 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-4/5 max-w-sm bg-forest-900 border-l border-gold-500/30 p-6 shadow-2xl flex flex-col justify-between h-full overflow-y-auto">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-forest-800">
                <div className="flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-gold-400" />
                  <span className="font-serif text-xl font-bold text-cream-50">
                    {siteConfig.name}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-cream-300 hover:text-gold-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Language Switcher inside Mobile Drawer */}
              <div className="py-4 border-b border-forest-800">
                <LanguageSwitcher isMobile={true} />
              </div>

              {/* Navigation list */}
              <nav className="mt-4 flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-cream-100 hover:text-gold-300 text-base font-medium py-2 px-3 rounded-lg hover:bg-forest-800/60 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            </div>

            {/* Mobile Actions Bottom */}
            <div className="pt-6 border-t border-forest-800 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-800 text-cream-100 font-semibold border border-forest-700"
              >
                <ShoppingBag className="w-4 h-4 text-gold-400" />
                <span>{t("nav.viewCart")} ({totalItems})</span>
              </button>

              <a
                href={generateWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-cream-50 font-semibold shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t("nav.whatsappOrder")}</span>
              </a>

              <div className="text-center text-xs text-cream-400/80 pt-2">
                {t("nav.needHelp")} {siteConfig.whatsappDisplayNumber}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
