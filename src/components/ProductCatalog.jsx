"use client";

import React, { useState, useMemo } from "react";
import { products } from "../data/products";
import ProductCard from "./ProductCard";
import { Search, SlidersHorizontal, Sparkles, X, ArrowUpDown } from "lucide-react";

export default function ProductCatalog({ activeCategory, onCategoryChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(activeCategory || "all");
  const [sortBy, setSortBy] = useState("popular");

  // Keep internal state in sync with external category clicks (from CategoryCards or nav)
  React.useEffect(() => {
    if (activeCategory) {
      setSelectedCategory(activeCategory);
    }
  }, [activeCategory]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("popular");
    if (onCategoryChange) {
      onCategoryChange("all");
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter
        const matchesCategory =
          selectedCategory === "all" || product.category === selectedCategory;

        // Search Filter (English name, Tamil name, transliteration, keywords, description)
        if (!searchQuery.trim()) return matchesCategory;

        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesEnglish = product.englishName.toLowerCase().includes(query);
        const matchesTamil = product.tamilName.includes(query);
        const matchesKeywords = product.searchKeywords.some((kw) =>
          kw.toLowerCase().includes(query)
        );
        const matchesDesc = product.shortDescription.toLowerCase().includes(query);

        return matchesCategory && (matchesName || matchesEnglish || matchesTamil || matchesKeywords || matchesDesc);
      })
      .sort((a, b) => {
        const minPriceA = a.weights[0].price;
        const minPriceB = b.weights[0].price;

        if (sortBy === "price-low") {
          return minPriceA - minPriceB;
        }
        if (sortBy === "price-high") {
          return minPriceB - minPriceA;
        }
        // "popular"
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return b.rating - a.rating;
      });
  }, [searchQuery, selectedCategory, sortBy]);

  const categoriesList = [
    { id: "all", label: "All Spices", tamil: "அனைத்தும்" },
    { id: "whole-spices", label: "Whole Spices", tamil: "முழு மசாலா" },
    { id: "powdered-spices", label: "Powdered Spices", tamil: "மசாலா தூள்" },
    { id: "cooking-essentials", label: "Cooking Essentials", tamil: "சமையல் பொருட்கள்" },
  ];

  return (
    <section id="products" className="py-20 bg-cream-50 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>Master Spice Collection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            Authentic Indian Spices & Essentials
          </h2>
          <p className="mt-3 text-forest-800/80 text-sm sm:text-base leading-relaxed">
            Search by English or Tamil name (e.g. <em>Milagu</em>, <em>Seeragam</em>, <em>மிளகு</em>). Hand-cleaned, sun-dried, and aroma-sealed.
          </p>
        </div>

        {/* Search, Filter & Sort Controls Bar */}
        <div className="bg-cream-100/90 rounded-2xl p-4 sm:p-6 border border-cream-300 shadow-sm mb-10">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-600" />
              <input
                id="product-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spices in English or Tamil (e.g., Milagu, Seeragam, மஞ்சள்)..."
                className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-white border border-cream-300 text-forest-950 placeholder-forest-600/60 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-forest-400 hover:text-forest-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end lg:self-auto w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-600 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-8 py-3.5 rounded-xl bg-white border border-cream-300 text-forest-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500/50 appearance-none cursor-pointer shadow-sm"
                >
                  <option value="popular">Popular Products</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-5 pt-5 border-t border-cream-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
            </span>
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-forest-900 text-gold-300 shadow-sm border border-gold-400/40"
                      : "bg-white hover:bg-cream-200/80 text-forest-800 border border-cream-300"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] opacity-75 ${isSelected ? "text-gold-200" : "text-forest-600"}`}>
                    ({cat.tamil})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info Counter */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-xs sm:text-sm text-forest-800 font-medium">
            Showing <strong className="text-forest-950 font-bold">{filteredProducts.length}</strong> of {products.length} spices
            {searchQuery && (
              <span>
                {" "}for &ldquo;<span className="text-forest-950 font-bold">{searchQuery}</span>&rdquo;
              </span>
            )}
          </p>
          {(searchQuery || selectedCategory !== "all" || sortBy !== "popular") && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-cream-300 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-cream-200 text-forest-700 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-950">No spices found</h3>
            <p className="mt-2 text-xs sm:text-sm text-forest-700 leading-relaxed">
              We couldn&apos;t find any spices matching &ldquo;{searchQuery}&rdquo;. Try searching by Tamil name, e.g. <em>Milagu</em> or <em>மிளகு</em>.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 px-6 py-2.5 rounded-xl bg-forest-900 text-gold-300 font-bold text-xs hover:bg-forest-800 shadow-sm"
            >
              Clear Search & View All
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
