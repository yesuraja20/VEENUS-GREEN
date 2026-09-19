"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import { siteConfig } from "../config/siteConfig";
import { generateWhatsAppOrderUrl } from "../utils/whatsapp";
import {
  X,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  Receipt,
  User,
  Phone,
  MapPin,
  Building,
  Navigation,
  CreditCard,
  Lock,
  Loader2,
} from "lucide-react";

export default function CheckoutModal() {
  const {
    cartItems,
    subtotal,
    shippingFee,
    grandTotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
  } = useCart();
  const { t, getTranslatedProduct, currentLanguage } = useLanguage();
  const { recordOrder } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  if (!isCheckoutOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = t("checkout.fullNameError");
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      newErrors.phone = t("checkout.mobileError");
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = t("checkout.streetError");
    }

    if (!formData.city.trim()) {
      newErrors.city = t("checkout.cityError");
    }

    const pincodeRegex = /^\d{6}$/;
    if (!formData.pincode.trim() || !pincodeRegex.test(formData.pincode.trim())) {
      newErrors.pincode = t("checkout.pincodeError");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Online Payment (Razorpay UPI / Cards / NetBanking)
  const handleOnlinePayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // 1. Create order on server
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          customer: formData,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      // If simulated or development mode (keys not yet configured)
      if (orderData.isSimulated) {
        const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);
        await recordOrder({
          id: orderId,
          customerName: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          notes: formData.notes,
          items: cartItems,
          subtotal,
          shippingFee,
          grandTotal,
          paymentMethod: "Online (Razorpay)",
          paymentStatus: "paid",
          paymentId: "pay_sim_" + Date.now(),
        });

        setOrderConfirmed({
          orderId,
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          type: "Online Payment (Paid)",
        });
        clearCart();
        return;
      }

      // Real Razorpay Checkout flow
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay payment gateway failed to load. Please check your internet connection.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: siteConfig.name,
        description: `Order for ${cartItems.length} item(s)`,
        image: "/icon.svg",
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: {
          color: "#1b382b",
        },
        handler: async function (response) {
          try {
            // Verify signature
            const verifyRes = await fetch("/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();

            const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);
            await recordOrder({
              id: orderId,
              customerName: formData.name,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              pincode: formData.pincode,
              notes: formData.notes,
              items: cartItems,
              subtotal,
              shippingFee,
              grandTotal,
              paymentMethod: "Online (Razorpay)",
              paymentStatus: verifyData.verified ? "paid" : "unverified",
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
            });

            setOrderConfirmed({
              orderId,
              date: new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              type: "Online (Razorpay - Paid)",
            });
            clearCart();
          } catch (verErr) {
            console.error("Payment verification failed:", verErr);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (resp) {
        setPaymentError(resp.error?.description || "Payment was not successful. Please try again.");
        setIsProcessingPayment(false);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error("Online payment error:", err);
      setPaymentError(err.message || "Failed to start payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // WhatsApp Order Submission
  const handleWhatsAppCheckout = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);

    // Save order in Supabase
    await recordOrder({
      id: orderId,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      notes: formData.notes,
      items: cartItems,
      subtotal,
      shippingFee,
      grandTotal,
      paymentMethod: "WhatsApp Order",
      paymentStatus: "pending",
    });

    const whatsappUrl = generateWhatsAppOrderUrl({
      customer: formData,
      items: cartItems,
      subtotal,
      shippingFee,
      grandTotal,
    });

    // Open WhatsApp in new window
    window.open(whatsappUrl, "_blank");

    // Set confirmed state
    setOrderConfirmed({
      orderId,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      type: "WhatsApp Order",
    });

    clearCart();
  };

  // Cash On Delivery Submission
  const handleCodCheckout = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);

    // Save order in Supabase
    await recordOrder({
      id: orderId,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      notes: formData.notes,
      items: cartItems,
      subtotal,
      shippingFee,
      grandTotal,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "pending",
    });

    setOrderConfirmed({
      orderId,
      date: new Date().toLocaleDateString(currentLanguage === "en" ? "en-IN" : `${currentLanguage}-IN`, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      type: "Cash on Delivery",
    });

    clearCart();
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderConfirmed(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-cream-50 rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-forest-900 text-cream-50 flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500 text-forest-950 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-cream-50">
                {orderConfirmed ? t("checkout.orderSummary") : t("checkout.modalTitle")}
              </h3>
              <p className="text-xs text-gold-300 font-medium">
                {orderConfirmed
                  ? `#${orderConfirmed.orderId}`
                  : t("checkout.modalSubtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label={t("checkout.closeModal") || "Close checkout"}
            className="p-2 text-cream-300 hover:text-white rounded-lg hover:bg-forest-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderConfirmed ? (
          /* Confirmation Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="font-serif text-2xl font-bold text-forest-950">
                {t("checkout.thankYou", { name: formData.name })}
              </h4>
              <p className="text-xs sm:text-sm text-forest-800 mt-1.5 max-w-md mx-auto leading-relaxed">
                {t("checkout.orderReceived", { orderId: orderConfirmed.orderId })}
              </p>
            </div>

            {/* Delivery address & Summary review */}
            <div className="bg-white p-5 rounded-2xl border border-cream-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">{t("checkout.orderDate")}</span>
                <span className="font-bold text-forest-950">{orderConfirmed.date}</span>
              </div>
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">{t("checkout.mobileContact")}</span>
                <span className="font-bold text-forest-950">+91 {formData.phone}</span>
              </div>
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">{t("checkout.shipTo")}</span>
                <span className="font-bold text-forest-950 text-right">
                  {formData.address}, {formData.city} - {formData.pincode}
                </span>
              </div>
              <div className="flex justify-between pt-1 font-serif text-sm font-bold text-forest-950">
                <span>{t("cartDrawer.grandTotal")}:</span>
                <span className="text-emerald-800">₹{grandTotal}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                {t("checkout.backToStore")}
              </button>

              <button
                onClick={() => {
                  const url = generateWhatsAppOrderUrl({
                    customer: formData,
                    items: cartItems,
                    subtotal,
                    shippingFee,
                    grandTotal,
                  });
                  window.open(url, "_blank");
                }}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-cream-50 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>{t("checkout.trackWhatsApp")}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form & Order Summary */
          <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6">
            {/* Order Items Review Snippet */}
            <div className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-700 mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gold-600" />
                <span>{t("checkout.orderSummary")} ({cartItems.length})</span>
              </h4>

              <div className="divide-y divide-cream-100 max-h-40 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const translated = getTranslatedProduct(item);
                  return (
                    <div key={item.cartKey} className="py-2 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-forest-950 truncate">{translated.name}</p>
                        <p className="text-[11px] text-emerald-800">
                          {translated.secondaryName || item.tamilName} • {item.selectedWeight?.label} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-forest-950 flex-shrink-0">
                        ₹{item.selectedWeight?.price * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-xs">
                <span className="text-forest-700">{t("cartDrawer.subtotal")}:</span>
                <span className="font-bold text-forest-950">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-forest-700">{t("cartDrawer.shipping")}:</span>
                <span className="font-bold text-emerald-800">
                  {shippingFee === 0 ? t("cartDrawer.free") : `₹${shippingFee}`}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-cream-200 flex items-center justify-between text-sm font-serif font-bold text-forest-950">
                <span>{t("cartDrawer.grandTotal")}:</span>
                <span className="text-emerald-900 text-base">₹{grandTotal}</span>
              </div>
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-700">
                {t("checkout.deliveryDetails")}
              </h4>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-forest-900 mb-1">
                  {t("checkout.fullName")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-forest-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t("checkout.fullNamePlaceholder")}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border text-sm text-forest-950 focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-cream-300 focus:ring-gold-400/40 focus:border-gold-500"
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-forest-900 mb-1">
                  {t("checkout.mobileNumber")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-white border text-sm text-forest-950 focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-cream-300 focus:ring-gold-400/40 focus:border-gold-500"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-semibold text-forest-900 mb-1">
                  {t("checkout.streetAddress")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-forest-500 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t("checkout.streetPlaceholder")}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border text-sm text-forest-950 focus:outline-none focus:ring-2 ${
                      errors.address
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-cream-300 focus:ring-gold-400/40 focus:border-gold-500"
                    }`}
                  />
                </div>
                {errors.address && <p className="text-[11px] text-rose-600 mt-1">{errors.address}</p>}
              </div>

              {/* City & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-forest-900 mb-1">
                    {t("checkout.city")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-forest-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder={t("checkout.cityPlaceholder")}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border text-sm text-forest-950 focus:outline-none focus:ring-2 ${
                        errors.city
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-cream-300 focus:ring-gold-400/40 focus:border-gold-500"
                      }`}
                    />
                  </div>
                  {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest-900 mb-1">
                    {t("checkout.pincode")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Navigation className="w-4 h-4 text-forest-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="641605"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border text-sm text-forest-950 focus:outline-none focus:ring-2 ${
                        errors.pincode
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-cream-300 focus:ring-gold-400/40 focus:border-gold-500"
                      }`}
                    />
                  </div>
                  {errors.pincode && <p className="text-[11px] text-rose-600 mt-1">{errors.pincode}</p>}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-forest-900 mb-1">
                  {t("checkout.notes")}
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t("checkout.notesPlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-cream-300 text-sm text-forest-950 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              {/* Payment Error Alert */}
              {paymentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {paymentError}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 space-y-3">
                {/* 1. Primary: Pay Online (UPI, Cards, NetBanking) */}
                <button
                  type="button"
                  onClick={handleOnlinePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 px-4 rounded-xl gold-gradient-bg text-forest-950 font-bold text-sm tracking-wide shadow-gold-glow hover:brightness-110 active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2.5 transition-all"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 text-forest-950 animate-spin" />
                      <span>Opening Secure Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 text-forest-950" />
                      <span>Pay Online (UPI / Cards / NetBanking) • ₹{grandTotal}</span>
                    </>
                  )}
                </button>

                {/* 2. Cash on Delivery */}
                <button
                  type="button"
                  onClick={handleCodCheckout}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 disabled:opacity-70 text-gold-300 font-bold text-sm tracking-wide border border-gold-500/40 flex items-center justify-center gap-2 transition-all"
                >
                  <span>{t("checkout.confirmCod")} (₹{grandTotal})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 3. Order on WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-70 text-cream-50 font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-300" />
                  <span>{t("checkout.sendWhatsApp")}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-forest-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                <span>{t("checkout.guarantee")}</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
