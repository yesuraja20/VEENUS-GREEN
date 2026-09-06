"use client";

import React from "react";
import { categories } from "../data/categories";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function CategoryCards({ onSelectCategory }) {
  const handleCategoryClick = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    const productsEl = document.getElementById("products");
    if (productsEl) {
      productsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="categories" className="py-20 bg-cream-100/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>Curated Collections</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            Explore by Category
          </h2>
          <p className="mt-4 text-forest-800/80 text-sm sm:text-base leading-relaxed">
            From handpicked whole pods to cold-milled single-origin powders, discover the core essentials of Indian culinary mastery.
          </p>
        </div>

        {/* 3 Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-luxury border border-forest-900/10 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Category Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-95"
              />

              {/* Gradient Overlays */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.bgGradient} opacity-85 group-hover:opacity-90 transition-opacity duration-300`}
              />

              {/* Badge Top Left */}
              <div className="absolute top-6 left-6 z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-forest-950/70 border border-gold-400/40 text-gold-300 text-xs font-semibold tracking-wider backdrop-blur-md">
                  {cat.badge}
                </span>
              </div>

              {/* Items count top right */}
              <div className="absolute top-6 right-6 z-10">
                <span className="px-3 py-1 rounded-full bg-cream-50/20 text-cream-100 text-xs font-medium backdrop-blur-md">
                  {cat.itemCount}
                </span>
              </div>

              {/* Content Bottom */}
              <div className="absolute inset-x-0 bottom-0 p-8 z-10 flex flex-col justify-end">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-300/90 mb-1">
                  {cat.tamilName}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-cream-50 mb-2">
                  {cat.name}
                </h3>
                <p className="text-cream-200/90 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-6 font-light">
                  {cat.description}
                </p>

                {/* Explore Button */}
                <div className="inline-flex items-center gap-2 text-gold-300 text-sm font-bold group-hover:text-gold-200 transition-colors">
                  <span>Explore Spices</span>
                  <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-forest-950 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
