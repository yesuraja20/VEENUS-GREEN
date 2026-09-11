"use client";

import React from "react";
import { ArrowRight, Sparkles, Award, ShieldCheck, Truck, Flame } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { useLanguage } from "../context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-forest-950 text-cream-50"
    >
      {/* Background Image with Cinematic Luxury Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=2000&q=85"
          alt="Traditional Indian Spices Assortment"
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-pulse-subtle filter brightness-50 contrast-125"
        />
        {/* Multi-layered Gradients for readability and deep forest aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/80 to-forest-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-forest-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent" />
      </div>

      {/* Decorative Floating Spices Tags */}
      <div className="hidden xl:block absolute top-28 left-12 z-10 animate-float-slow">
        <div className="glass-forest px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-gold-400/30 shadow-gold-glow/20">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wider text-gold-300 font-semibold">{t("hero.badge1Title")}</p>
            <p className="text-xs font-bold text-cream-100">{t("hero.badge1Desc")}</p>
          </div>
        </div>
      </div>

      <div className="hidden xl:block absolute bottom-36 right-14 z-10 animate-float-slow [animation-delay:2s]">
        <div className="glass-forest px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-gold-400/30 shadow-gold-glow/20">
          <Flame className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wider text-gold-300 font-semibold">{t("hero.badge2Title")}</p>
            <p className="text-xs font-bold text-cream-100">{t("hero.badge2Desc")}</p>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Heritage Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-800/80 border border-gold-400/40 text-gold-300 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6 backdrop-blur-md shadow-inner-gold">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>{t("hero.heritagePill")}</span>
        </div>

        {/* Main Heading */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-cream-50 leading-[1.15] max-w-4xl">
          {t("hero.headingPart1")} <br />
          <span className="gold-gradient-text italic font-normal">{t("hero.headingPart2")}</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-base sm:text-xl text-cream-200/90 max-w-2xl font-light leading-relaxed">
          {t("hero.subheading")}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href="#products"
            className="w-full sm:w-auto px-8 py-4 rounded-xl gold-gradient-bg text-forest-950 font-bold text-sm sm:text-base tracking-wide shadow-gold-glow hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>{t("hero.exploreButton")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#categories"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-forest-900/80 hover:bg-forest-800 text-cream-100 font-semibold text-sm sm:text-base tracking-wide border border-gold-400/30 hover:border-gold-400 backdrop-blur-md active:scale-95 transition-all duration-300 flex items-center justify-center"
          >
            <span>{t("categories.sectionTitle")}</span>
          </a>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-16 pt-10 border-t border-forest-800/80 w-full grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800/60 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-cream-100">{t("hero.stat2Label")}</h2>
              <p className="text-[11px] text-cream-400">100% {t("whyChooseUs.p3Title")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800/60 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-cream-100">{t("about.craftTitle")}</h2>
              <p className="text-[11px] text-cream-400">{t("whyChooseUs.p1Title")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800/60 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-cream-100">{t("about.stat1Label")}</h2>
              <p className="text-[11px] text-cream-400">{t("about.stat1Num")} {t("categories.spicesCount")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800/60 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-cream-100">{t("whyChooseUs.p5Title")}</h2>
              <p className="text-[11px] text-cream-400">{t("whyChooseUs.p4Title")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
