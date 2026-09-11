"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { X, Star, ShoppingBag, Check, MapPin, Sparkles, ShieldCheck } from "lucide-react";

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useCart();
  const { t, getTranslatedProduct } = useLanguage();
  const [selectedWeight, setSelectedWeight] = useState(
    quickViewProduct ? quickViewProduct.weights[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Sync selectedWeight when quickViewProduct changes
  React.useEffect(() => {
    if (quickViewProduct) {
      setSelectedWeight(quickViewProduct.weights[0]);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const item = getTranslatedProduct(quickViewProduct);
  const currentWeight = selectedWeight || quickViewProduct.weights[0];

  const handleAdd = () => {
    addToCart(quickViewProduct, currentWeight, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-3xl bg-cream-50 rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          aria-label={t("quickView.close") || "Close modal"}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-forest-950/80 text-cream-200 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Side */}
        <div className="md:w-1/2 relative h-64 md:h-auto bg-forest-950">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-cream-100">
            <div className="flex items-center gap-1.5 text-xs bg-forest-900/90 px-3 py-1.5 rounded-full border border-gold-400/30">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>{item.origin}</span>
            </div>
            {item.badge && (
              <span className="text-xs bg-gold-500 text-forest-950 font-bold px-3 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
        </div>

        {/* Content Side */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Category and Local name */}
            <div className="flex items-center justify-between text-xs font-bold text-forest-600 mb-1">
              <span className="uppercase tracking-wider">{item.categoryLabel}</span>
              {item.tamilName && (
                <span className="text-emerald-800 font-serif text-sm">{item.tamilName}</span>
              )}
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-bold text-forest-950 leading-tight">
              {item.name}{" "}
              {item.englishName && item.englishName !== item.name && (
                <span className="text-sm font-sans font-medium text-forest-600">
                  ({item.englishName})
                </span>
              )}
            </h3>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex text-gold-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-forest-900">{item.rating}</span>
              <span className="text-xs text-forest-600">({item.reviewCount} reviews)</span>
            </div>

            {/* Description */}
            <p className="mt-4 text-xs sm:text-sm text-forest-800 leading-relaxed font-light">
              {item.fullDescription || item.shortDescription}
            </p>

            {/* Purity guarantee pill */}
            <div className="mt-4 p-3 rounded-xl bg-forest-50 border border-forest-200/80 flex items-center gap-2.5 text-xs text-forest-900">
              <ShieldCheck className="w-4 h-4 text-forest-700 flex-shrink-0" />
              <span>{t("quickView.inStock") || "Triple-sorted, vacuum packed within 24 hours."}</span>
            </div>

            {/* Weight selector */}
            <div className="mt-5">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800 block mb-2">
                {t("quickView.packWeight") || "Choose Weight:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {item.weights.map((w) => (
                  <button
                    key={w.label}
                    onClick={() => setSelectedWeight(w)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentWeight.label === w.label
                        ? "bg-forest-900 text-gold-300 border border-gold-400"
                        : "bg-cream-200 text-forest-900 hover:bg-cream-300"
                    }`}
                  >
                    {w.label} - ₹{w.price}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Add to Cart footer */}
          <div className="mt-6 pt-5 border-t border-cream-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] text-forest-600 uppercase font-bold">
                  {t("cartDrawer.grandTotal") || "Total Price"}:
                </span>
                <p className="font-serif text-3xl font-bold text-forest-950">
                  ₹{currentWeight.price * quantity}
                </p>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center rounded-xl border border-cream-300 bg-white">
                <button
                  onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                  className="px-3 py-2 text-forest-800 hover:bg-cream-100 rounded-l-xl font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-forest-950 select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-forest-800 hover:bg-cream-100 rounded-r-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
                isAdded
                  ? "bg-emerald-700 text-cream-50"
                  : "bg-forest-900 hover:bg-forest-800 text-gold-300 border border-gold-500/40 shadow-md"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-gold-300" />
                  <span>{t("productCard.addedToCart") || "Added to Your Cart!"}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-gold-400" />
                  <span>{t("quickView.addToCart") || `Add to Basket`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

