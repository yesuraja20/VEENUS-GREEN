"use client";

import React from "react";
import { Sparkles, Award, ShieldCheck, HeartHandshake, CheckCircle2 } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export default function AboutSection() {
  const highlights = [
    {
      title: "Direct Farm Provenance",
      desc: "Harvested directly from certified growers in Wayanad, Idukki, Salem, and Rajasthan with zero middlemen dilution.",
    },
    {
      title: "Cold Stone-Ground Technique",
      desc: "Our spices are milled at low RPM stone mills below 40°C, preserving fragile terpenes, essential aroma oils, and vibrant color.",
    },
    {
      title: "Zero Preservatives or Fillers",
      desc: "Strictly 100% natural spices. No artificial food coloring, lead chromate, chalk, starch, or MSG. Pure unadulterated taste.",
    },
    {
      title: "Multi-Layer Aroma Lock",
      desc: "Packed in food-grade, nitrogen-flushed, moisture-barrier pouches that keep your spices freshly ground for months.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-forest-950 text-cream-50 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Showcase */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden border-2 border-gold-500/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80"
                alt="Traditional Indian spice grinding and heritage harvesting"
                className="w-full h-[450px] sm:h-[520px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-transparent to-transparent" />

              {/* Inset floating badge */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl glass-forest border border-gold-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold-500 text-forest-950 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-cream-50">
                      Heritage Spice Craftsmanship
                    </h4>
                    <p className="text-xs text-gold-300/90">
                      Rooted in timeless South Indian culinary traditions since inception.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Border Frame */}
            <div className="hidden sm:block absolute -bottom-4 -right-4 w-full h-full rounded-3xl border-2 border-gold-500/20 -z-0 pointer-events-none" />
          </div>

          {/* Right Column: Story & Principles */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-900 border border-gold-400/40 text-gold-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Our Heritage & Purpose</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-cream-50 leading-tight">
              Tradition in Every Spice
            </h2>

            <p className="mt-5 text-sm sm:text-base text-cream-200/90 leading-relaxed font-light">
              At <strong className="text-gold-300 font-semibold">{siteConfig.name}</strong>, we believe authentic cooking begins with uncompromised ingredients. In modern grocery aisles, mass-commercialized spices are often over-processed, blended with chaff, or stripped of their therapeutic volatile oils.
            </p>

            <p className="mt-3 text-sm sm:text-base text-cream-200/80 leading-relaxed font-light">
              We travel directly to the ancient spice belts of South India—from the misty heights of Wayanad for bold Tellicherry black pepper to Salem&apos;s fertile red soils for high-curcumin turmeric. Each batch is sun-cured, hand-cleaned, and packed under rigorous hygiene standards.
            </p>

            {/* Feature Highlights Grid */}
            <div className="mt-8 space-y-4">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-forest-900/70 border border-forest-800 hover:border-gold-500/40 transition-colors flex items-start gap-3.5"
                >
                  <CheckCircle2 className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-cream-100">{item.title}</h3>
                    <p className="text-xs text-cream-300/80 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-10 pt-8 border-t border-forest-800/80 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-serif text-3xl sm:text-4xl font-bold gold-gradient-text">15+</p>
                <p className="text-xs text-cream-300 mt-1">Heritage Spices</p>
              </div>
              <div>
                <p className="font-serif text-3xl sm:text-4xl font-bold gold-gradient-text">100%</p>
                <p className="text-xs text-cream-300 mt-1">Pure & Natural</p>
              </div>
              <div>
                <p className="font-serif text-3xl sm:text-4xl font-bold gold-gradient-text">10K+</p>
                <p className="text-xs text-cream-300 mt-1">Happy Kitchens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
