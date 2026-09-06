"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Plus, Minus, ShoppingBag, Check, Star, Eye } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart, setQuickViewProduct } = useCart();
  const [selectedWeight, setSelectedWeight] = useState(product.weights[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart(product, selectedWeight, quantity);
    setIsAddedRecently(true);
    setTimeout(() => {
      setIsAddedRecently(false);
    }, 1800);
  };

  return (
    <div className="group bg-cream-50 rounded-2xl overflow-hidden border border-cream-300/80 hover:border-gold-500/50 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Container */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-cream-200">
        <img
          src={product.image}
          alt={`${product.name} - ${product.tamilName}`}
          className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full bg-forest-950/80 border border-gold-400/40 text-gold-300 text-[10px] sm:text-xs font-bold tracking-wide backdrop-blur-md">
              {product.badge}
            </span>
          )}
        </div>

        {/* Quick View Button on hover */}
        <button
          onClick={() => setQuickViewProduct(product)}
          aria-label={`Quick view ${product.name}`}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-cream-50/90 text-forest-900 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 shadow-md hover:bg-gold-500 hover:text-forest-950"
          title="Quick View Details"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Rating Pill bottom left of image */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-950/75 backdrop-blur-md text-cream-100 text-xs">
          <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span className="font-bold">{product.rating}</span>
          <span className="text-cream-400 text-[10px]">({product.reviewCount})</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tamil & Category Tag */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 tracking-wider">
              {product.tamilName}
            </span>
            <span className="text-[10px] uppercase font-semibold text-forest-600/70">
              {product.origin.split(",")[0]}
            </span>
          </div>

          {/* Product English Name */}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-forest-950 leading-snug group-hover:text-forest-700 transition-colors">
            {product.name}{" "}
            <span className="text-xs font-sans font-medium text-forest-600">
              ({product.englishName})
            </span>
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs text-forest-800/80 line-clamp-2 leading-relaxed font-normal">
            {product.shortDescription}
          </p>

          {/* Weight Selection Options */}
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-forest-700 block mb-1.5">
              Select Pack Size:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {product.weights.map((w) => {
                const isSelected = selectedWeight.label === w.label;
                return (
                  <button
                    key={w.label}
                    type="button"
                    onClick={() => setSelectedWeight(w)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-forest-900 text-gold-300 shadow-sm border border-gold-400/40"
                        : "bg-cream-200/80 hover:bg-cream-300 text-forest-900 border border-transparent"
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing & Cart Controls */}
        <div className="mt-6 pt-4 border-t border-cream-200/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-forest-600 font-medium">Price:</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-2xl font-bold text-forest-950">
                  ₹{selectedWeight.price}
                </span>
                <span className="text-xs text-forest-600 font-medium">
                  / {selectedWeight.label}
                </span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center rounded-lg border border-cream-300 bg-cream-100 overflow-hidden">
              <button
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="p-1.5 text-forest-800 hover:bg-cream-200 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-forest-950 select-none">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="p-1.5 text-forest-800 hover:bg-cream-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
              isAddedRecently
                ? "bg-emerald-700 text-cream-50 shadow-md"
                : "bg-forest-900 hover:bg-forest-800 active:scale-98 text-gold-300 hover:text-gold-200 border border-gold-500/30 hover:border-gold-400"
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-4 h-4 text-gold-300" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-gold-400" />
                <span>Add to Cart • ₹{selectedWeight.price * quantity}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
