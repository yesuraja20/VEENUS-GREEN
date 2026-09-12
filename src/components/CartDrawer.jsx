"use client";

import React from "react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { siteConfig } from "../config/siteConfig";
import { generateWhatsAppOrderUrl } from "../utils/whatsapp";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Sparkles,
  MessageCircle,
} from "lucide-react";

export default function CartDrawer() {
  const {
    cartItems,
    totalItems,
    subtotal,
    shippingFee,
    grandTotal,
    isFreeDelivery,
    amountNeededForFreeShipping,
    freeThreshold,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { t, getTranslatedProduct } = useLanguage();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleInstantWhatsAppOrder = () => {
    const url = generateWhatsAppOrderUrl({
      customer: { name: "Direct Cart Customer", phone: "" },
      items: cartItems,
      subtotal,
      shippingFee,
      grandTotal,
    });
    window.open(url, "_blank");
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream-50 shadow-2xl border-l border-gold-500/20 flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 bg-forest-900 text-cream-50 border-b border-forest-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold-500 text-forest-950 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-cream-50">
                    {t("cartDrawer.title")}
                  </h3>
                  <p className="text-xs text-gold-300/80 font-medium">
                    {totalItems} {totalItems === 1 ? t("cartDrawer.item") || "item" : t("cartDrawer.items") || "items"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                aria-label={t("cartDrawer.closeCart") || "Close cart"}
                className="p-2 text-cream-300 hover:text-white rounded-lg hover:bg-forest-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="mt-4 pt-3 border-t border-forest-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-cream-200">
                  <Truck className="w-3.5 h-3.5 text-gold-400" />
                  {isFreeDelivery ? (
                    <span className="text-gold-300 font-bold">{t("cartDrawer.freeShippingUnlocked")}</span>
                  ) : (
                    <span>
                      {t("cartDrawer.addMoreForFreeShipping", { amount: amountNeededForFreeShipping })}
                    </span>
                  )}
                </span>
                <span className="text-cream-400 text-[10px]">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-2 bg-forest-950 rounded-full overflow-hidden">
                <div
                  className="h-full gold-gradient-bg transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center text-forest-700 mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <h4 className="font-serif text-xl font-bold text-forest-950">{t("cartDrawer.emptyTitle")}</h4>
                <p className="mt-2 text-xs sm:text-sm text-forest-700 max-w-xs leading-relaxed">
                  {t("cartDrawer.emptyDesc")}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-3 rounded-xl bg-forest-900 text-gold-300 font-bold text-xs uppercase tracking-wider hover:bg-forest-800 transition-all shadow-md"
                >
                  {t("cartDrawer.startShopping")}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                  <span className="text-xs font-semibold text-forest-700 uppercase tracking-wider">
                    {t("checkout.orderSummary")}
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-700 hover:text-rose-900 font-medium underline"
                  >
                    {t("cartDrawer.clear") || "Clear"}
                  </button>
                </div>

                {cartItems.map((item) => {
                  const translated = getTranslatedProduct(item);
                  return (
                    <div
                      key={item.cartKey}
                      className="flex gap-3.5 p-3 rounded-2xl bg-white border border-cream-200/90 shadow-sm relative group"
                    >
                      {/* Item Thumbnail */}
                      <img
                        src={item.image}
                        alt={translated.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-cream-200"
                      />

                      {/* Item Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-serif text-sm font-bold text-forest-950 truncate">
                              {translated.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.cartKey)}
                              aria-label={`Remove ${translated.name}`}
                              className="text-cream-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[11px] text-emerald-800 font-semibold -mt-0.5">
                            {translated.secondaryName || item.tamilName} • <span className="text-forest-600">{item.selectedWeight?.label}</span>
                          </p>
                        </div>

                        {/* Controls & Price */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center rounded-lg border border-cream-300 bg-cream-100">
                            <button
                              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                              className="p-1 text-forest-800 hover:bg-cream-200 rounded-l-lg"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-forest-950">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                              className="p-1 text-forest-800 hover:bg-cream-200 rounded-r-lg"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="font-serif text-sm font-bold text-forest-950">
                              ₹{item.selectedWeight?.price * item.quantity}
                            </span>
                            <span className="block text-[10px] text-forest-600">
                              ₹{item.selectedWeight?.price} {t("cartDrawer.each") || "each"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white border-t border-cream-200/90 shadow-lg space-y-4">
              {/* Billing Summary */}
              <div className="space-y-1.5 text-xs text-forest-800">
                <div className="flex justify-between">
                  <span>{t("cartDrawer.subtotal")}</span>
                  <span className="font-bold text-forest-950">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t("cartDrawer.shipping")}</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">
                      {t("cartDrawer.free")}
                    </span>
                  ) : (
                    <span className="font-bold text-forest-950">₹{shippingFee}</span>
                  )}
                </div>
                <div className="pt-2 border-t border-cream-200 flex justify-between text-base font-serif font-bold text-forest-950">
                  <span>{t("cartDrawer.grandTotal")}</span>
                  <span className="text-emerald-900">₹{grandTotal}</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-4 rounded-xl gold-gradient-bg text-forest-950 font-bold text-sm tracking-wide shadow-gold-glow flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 transition-all"
                >
                  <span>{t("cartDrawer.proceedCheckout")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleInstantWhatsAppOrder}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-cream-50 font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>{t("cartDrawer.whatsappOrder")}</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-forest-600/70">
                🔒 {t("cartDrawer.safePackaging") || "Safe & Hygienic Packaging • 100% Quality Assured"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
