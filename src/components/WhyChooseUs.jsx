"use client";

import React from "react";
import {
  Award,
  Leaf,
  ShieldCheck,
  CheckCircle,
  Truck,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function WhyChooseUs() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Award,
      title: t("whyChooseUs.p1Title") || "Estate Direct Sourcing",
      desc: t("whyChooseUs.p1Desc") || "Grade-A export standard whole seeds and single-origin powders, devoid of chaff or broken debris.",
    },
    {
      icon: Leaf,
      title: t("whyChooseUs.p2Title") || "Cold Stone-Ground",
      desc: t("whyChooseUs.p2Desc") || "Traditional slow-milling below 40°C to lock in delicate essential oils, volatile aroma, and nutrition.",
    },
    {
      icon: ShieldCheck,
      title: t("whyChooseUs.p3Title") || "100% Zero Fillers",
      desc: t("whyChooseUs.p3Desc") || "No synthetic colors, spent spice wastes, artificial flavors, or chemical preservatives. Pure nature.",
    },
    {
      icon: CheckCircle,
      title: t("whyChooseUs.p4Title") || "Aroma-Lock Pouches",
      desc: t("whyChooseUs.p4Desc") || "Multi-layer nitrogen-flushed zip barrier packaging that preserves freshly ground freshness for months.",
    },
    {
      icon: Truck,
      title: t("whyChooseUs.p5Title") || "Direct Express Dispatch",
      desc: t("whyChooseUs.p5Desc") || "Fresh batches dispatched within 24 hours of ordering with door-to-door courier tracking across India.",
    },
    {
      icon: MessageCircle,
      title: t("whyChooseUs.p6Title") || "Ancient Wellness Purity",
      desc: t("whyChooseUs.p6Desc") || "Curated according to Ayurvedic and traditional South Indian culinary science for optimal therapeutic benefits.",
    },
  ];

  return (
    <section id="why-choose-us" className="py-24 bg-cream-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-900 text-gold-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>{t("whyChooseUs.sectionBadge") || "Why Venus Green"}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            {t("whyChooseUs.sectionTitle") || "The Gold Standard in Pure Spices"}
          </h2>
          <p className="mt-4 text-forest-800/80 text-sm sm:text-base leading-relaxed">
            {t("whyChooseUs.sectionDesc") || "We bridge the gap between traditional spice farm hills and modern home kitchens with uncompromising purity standards."}
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-white border border-cream-200/90 shadow-sm hover:shadow-luxury hover:border-gold-500/40 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-forest-900 text-gold-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-forest-800 transition-all duration-300 shadow-md">
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-forest-950 mb-2.5 group-hover:text-forest-800 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-forest-800/80 leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-cream-100 flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>{t("about.stat2Label") || "100% Pure & Natural"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

