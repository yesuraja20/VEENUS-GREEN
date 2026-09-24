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
  Printer,
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
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        if (window.Razorpay) {
          resolve(true);
        } else {
          existingScript.addEventListener("load", () => resolve(true));
          existingScript.addEventListener("error", () => resolve(false));
        }
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
    e?.preventDefault?.();
    if (!validateForm()) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    const snapshotItems = [...cartItems];
    const snapshotCustomer = { ...formData };
    const snapshotSubtotal = subtotal;
    const snapshotShippingFee = shippingFee;
    const snapshotGrandTotal = grandTotal;

    try {
      // 1. Create order on backend (with server-side amount & items validation)
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: snapshotGrandTotal,
          customer: snapshotCustomer,
          items: snapshotItems,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initiate payment gateway.");
      }

      // If simulated (keys not configured or in development preview)
      if (orderData.isSimulated) {
        const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);
        const simPaymentId = "pay_sim_" + Date.now();
        const orderPayload = {
          id: orderId,
          customerName: snapshotCustomer.name,
          phone: snapshotCustomer.phone,
          address: snapshotCustomer.address,
          city: snapshotCustomer.city,
          pincode: snapshotCustomer.pincode,
          notes: snapshotCustomer.notes,
          items: snapshotItems,
          subtotal: snapshotSubtotal,
          shippingFee: snapshotShippingFee,
          grandTotal: snapshotGrandTotal,
        };

        // Call verify-payment to verify and save to Supabase from server
        try {
          await fetch("/api/payment/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isSimulated: true,
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: simPaymentId,
              orderData: orderPayload,
            }),
          });
        } catch (e) {
          console.warn("Server order recording warn:", e);
        }

        // Keep StoreContext updated
        await recordOrder({
          ...orderPayload,
          paymentMethod: "Online (Razorpay)",
          paymentStatus: "paid",
          paymentId: simPaymentId,
          razorpayOrderId: orderData.orderId,
        });

        setOrderConfirmed({
          orderId,
          paymentId: simPaymentId,
          razorpayOrderId: orderData.orderId,
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          type: "Online (Razorpay - Paid)",
          customer: snapshotCustomer,
          items: snapshotItems,
          subtotal: snapshotSubtotal,
          shippingFee: snapshotShippingFee,
          grandTotal: snapshotGrandTotal,
          isPaid: true,
        });
        clearCart();
        return;
      }

      // Real Razorpay Gateway Checkout Flow
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error(
          "Razorpay payment gateway failed to load. Please check your internet connection."
        );
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: siteConfig.name,
        description: `Order for ${snapshotItems.length} item(s) - Venus Green Spices`,
        image:
          typeof window !== "undefined"
            ? `${window.location.origin}/icon.svg`
            : "/icon.svg",
        order_id: orderData.orderId,
        prefill: {
          name: snapshotCustomer.name,
          contact: snapshotCustomer.phone,
        },
        theme: {
          color: "#1b382b",
        },
        handler: async function (response) {
          try {
            setIsProcessingPayment(true);
            const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);
            const orderPayload = {
              id: orderId,
              customerName: snapshotCustomer.name,
              phone: snapshotCustomer.phone,
              address: snapshotCustomer.address,
              city: snapshotCustomer.city,
              pincode: snapshotCustomer.pincode,
              notes: snapshotCustomer.notes,
              items: snapshotItems,
              subtotal: snapshotSubtotal,
              shippingFee: snapshotShippingFee,
              grandTotal: snapshotGrandTotal,
            };

            // 1. Verify payment signature on backend & save to Supabase
            const verifyRes = await fetch("/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: orderPayload,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success || !verifyData.verified) {
              throw new Error(verifyData.error || "Payment signature verification failed.");
            }

            // 2. Sync into client StoreContext cache
            await recordOrder({
              ...orderPayload,
              paymentMethod: "Online (Razorpay)",
              paymentStatus: "paid",
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
            });

            // 3. Set confirmed order state with complete snapshot
            setOrderConfirmed({
              orderId,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              date: new Date().toLocaleDateString(
                currentLanguage === "en" ? "en-IN" : `${currentLanguage}-IN`,
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              ),
              type: "Online (Razorpay - Paid)",
              customer: snapshotCustomer,
              items: snapshotItems,
              subtotal: snapshotSubtotal,
              shippingFee: snapshotShippingFee,
              grandTotal: snapshotGrandTotal,
              isPaid: true,
            });

            // 4. Clear cart
            clearCart();
          } catch (verErr) {
            console.error("Payment verification error:", verErr);
            setPaymentError(
              verErr.message || "Payment verification failed. Please contact customer support."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
          escape: true,
          backdropclose: false,
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (resp) {
        setPaymentError(
          resp.error?.description || "Payment was not successful. Please try again."
        );
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

    const snapshotItems = [...cartItems];
    const snapshotCustomer = { ...formData };
    const snapshotSubtotal = subtotal;
    const snapshotShippingFee = shippingFee;
    const snapshotGrandTotal = grandTotal;

    const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);

    // Save order in Supabase
    await recordOrder({
      id: orderId,
      customerName: snapshotCustomer.name,
      phone: snapshotCustomer.phone,
      address: snapshotCustomer.address,
      city: snapshotCustomer.city,
      pincode: snapshotCustomer.pincode,
      notes: snapshotCustomer.notes,
      items: snapshotItems,
      subtotal: snapshotSubtotal,
      shippingFee: snapshotShippingFee,
      grandTotal: snapshotGrandTotal,
      paymentMethod: "WhatsApp Order",
      paymentStatus: "pending",
    });

    const whatsappUrl = generateWhatsAppOrderUrl({
      customer: snapshotCustomer,
      items: snapshotItems,
      subtotal: snapshotSubtotal,
      shippingFee: snapshotShippingFee,
      grandTotal: snapshotGrandTotal,
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
      customer: snapshotCustomer,
      items: snapshotItems,
      subtotal: snapshotSubtotal,
      shippingFee: snapshotShippingFee,
      grandTotal: snapshotGrandTotal,
      isPaid: false,
    });

    clearCart();
  };

  // Cash On Delivery Submission
  const handleCodCheckout = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const snapshotItems = [...cartItems];
    const snapshotCustomer = { ...formData };
    const snapshotSubtotal = subtotal;
    const snapshotShippingFee = shippingFee;
    const snapshotGrandTotal = grandTotal;

    const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);

    // Save order in Supabase
    await recordOrder({
      id: orderId,
      customerName: snapshotCustomer.name,
      phone: snapshotCustomer.phone,
      address: snapshotCustomer.address,
      city: snapshotCustomer.city,
      pincode: snapshotCustomer.pincode,
      notes: snapshotCustomer.notes,
      items: snapshotItems,
      subtotal: snapshotSubtotal,
      shippingFee: snapshotShippingFee,
      grandTotal: snapshotGrandTotal,
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
      customer: snapshotCustomer,
      items: snapshotItems,
      subtotal: snapshotSubtotal,
      shippingFee: snapshotShippingFee,
      grandTotal: snapshotGrandTotal,
      isPaid: false,
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
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="font-serif text-2xl font-bold text-forest-950">
                {t("checkout.thankYou", { name: orderConfirmed.customer?.name || formData.name })}
              </h4>
              <p className="text-xs sm:text-sm text-forest-800 mt-1.5 max-w-md mx-auto leading-relaxed">
                {t("checkout.orderReceived", { orderId: orderConfirmed.orderId })}
              </p>

              {/* Verified Razorpay Payment Badge */}
              {orderConfirmed.paymentId && (
                <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Razorpay Payment Verified</span>
                  <span className="font-mono text-[11px] bg-white/90 px-1.5 py-0.5 rounded text-emerald-900 border border-emerald-200">
                    {orderConfirmed.paymentId}
                  </span>
                </div>
              )}
            </div>

            {/* Delivery address & Summary review */}
            <div className="bg-white p-5 rounded-2xl border border-cream-200 text-left text-xs space-y-2.5 max-w-md mx-auto shadow-sm">
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">{t("checkout.orderDate")}</span>
                <span className="font-bold text-forest-950">{orderConfirmed.date}</span>
              </div>
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">Payment Method</span>
                <span className="font-bold text-emerald-800">{orderConfirmed.type}</span>
              </div>
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">{t("checkout.mobileContact")}</span>
                <span className="font-bold text-forest-950">+91 {orderConfirmed.customer?.phone || formData.phone}</span>
              </div>
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">{t("checkout.shipTo")}</span>
                <span className="font-bold text-forest-950 text-right max-w-[220px]">
                  {orderConfirmed.customer?.address || formData.address}, {orderConfirmed.customer?.city || formData.city} - {orderConfirmed.customer?.pincode || formData.pincode}
                </span>
              </div>

              {/* Items List in Confirmation */}
              {orderConfirmed.items && orderConfirmed.items.length > 0 && (
                <div className="py-2 border-b border-cream-200">
                  <span className="text-forest-600 font-semibold block mb-1.5">
                    Ordered Items ({orderConfirmed.items.length}):
                  </span>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1 text-[11px]">
                    {orderConfirmed.items.map((it, idx) => (
                      <div key={it.cartKey || idx} className="flex justify-between text-forest-800">
                        <span className="truncate pr-2">
                          {it.name} ({it.selectedWeight?.label}) × {it.quantity}
                        </span>
                        <span className="font-bold flex-shrink-0 text-forest-950">
                          ₹{(it.selectedWeight?.price || it.price) * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xs text-forest-700">
                <span>{t("cartDrawer.subtotal")}:</span>
                <span className="font-bold text-forest-950">₹{orderConfirmed.subtotal || subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-forest-700">
                <span>{t("cartDrawer.shipping")}:</span>
                <span className="font-bold text-emerald-800">
                  {(orderConfirmed.shippingFee ?? shippingFee) === 0
                    ? t("cartDrawer.free")
                    : `₹${orderConfirmed.shippingFee ?? shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-cream-200 font-serif text-sm font-bold text-forest-950">
                <span>{t("cartDrawer.grandTotal")}:</span>
                <span className="text-emerald-800 text-base">₹{orderConfirmed.grandTotal || grandTotal}</span>
              </div>
              <p className="text-[10px] text-forest-500 italic text-center pt-1">
                All prices are inclusive of 5% GST.
              </p>
            </div>

            {/* Action Buttons: Print Bill, WhatsApp, Back to Store */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-3 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-forest-300 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 text-forest-700" />
                <span>Print Bill / Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = generateWhatsAppOrderUrl({
                    customer: orderConfirmed.customer || formData,
                    items: orderConfirmed.items || [],
                    subtotal: orderConfirmed.subtotal || subtotal,
                    shippingFee: orderConfirmed.shippingFee ?? shippingFee,
                    grandTotal: orderConfirmed.grandTotal || grandTotal,
                  });
                  window.open(url, "_blank");
                }}
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-cream-50 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>{t("checkout.trackWhatsApp")}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                {t("checkout.backToStore")}
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

      {/* Printable Tax Invoice / Bill (Only visible when printing) */}
      {orderConfirmed && (
        <div id="printable-bill" className="hidden">
          <div className="max-w-2xl mx-auto p-4 bg-white text-forest-950 font-sans">
            {/* Header */}
            <div className="border-b-2 border-forest-900 pb-4 mb-4 flex justify-between items-start">
              <div>
                <h1 className="font-serif text-2xl font-bold text-forest-950">
                  {siteConfig.legalName || siteConfig.name}
                </h1>
                <p className="text-xs text-forest-700 italic">{siteConfig.tagline}</p>
                <p className="text-xs text-forest-600 mt-1 max-w-sm">
                  {siteConfig.address?.fullAddress}
                </p>
                <p className="text-xs text-forest-600">
                  Phone: {siteConfig.whatsappDisplayNumber || siteConfig.phone} | Email: {siteConfig.email}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-forest-900 text-gold-300 text-xs font-bold rounded uppercase">
                  Tax Invoice
                </span>
                <p className="font-mono text-xs font-bold mt-2">
                  Invoice #: {orderConfirmed.orderId}
                </p>
                <p className="text-[11px] text-forest-600">Date: {orderConfirmed.date}</p>
                <p className="text-[11px] font-semibold text-emerald-800">
                  Payment: {orderConfirmed.type}
                </p>
                {orderConfirmed.paymentId && (
                  <p className="text-[10px] font-mono text-forest-500">
                    Ref ID: {orderConfirmed.paymentId}
                  </p>
                )}
              </div>
            </div>

            {/* Billed To */}
            <div className="bg-cream-100 p-3 rounded-lg border border-cream-200 mb-4 text-xs">
              <h3 className="font-bold text-forest-900 uppercase text-[10px] tracking-wider mb-1">
                Billed & Shipped To:
              </h3>
              <p className="font-bold text-forest-950 text-sm">{orderConfirmed.customer?.name}</p>
              <p className="text-forest-800">+91 {orderConfirmed.customer?.phone}</p>
              <p className="text-forest-800">
                {orderConfirmed.customer?.address}, {orderConfirmed.customer?.city} - {orderConfirmed.customer?.pincode}
              </p>
              {orderConfirmed.customer?.notes && (
                <p className="text-forest-600 italic mt-0.5">
                  Notes: {orderConfirmed.customer?.notes}
                </p>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full text-left border-collapse text-xs mb-4">
              <thead>
                <tr className="border-b-2 border-forest-900 bg-cream-100 text-forest-900 font-bold">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2 text-center">Pack</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Price</th>
                  <th className="py-2 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {(orderConfirmed.items || []).map((item, index) => {
                  const unitPrice = item.selectedWeight?.price || item.price;
                  const itemTotal = unitPrice * item.quantity;
                  return (
                    <tr key={item.cartKey || index}>
                      <td className="py-2 px-2">{index + 1}</td>
                      <td className="py-2 px-2 font-semibold">
                        {item.name}
                        {item.tamilName && (
                          <span className="text-forest-600 font-normal ml-1">
                            ({item.tamilName})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center text-forest-700">
                        {item.selectedWeight?.label || "-"}
                      </td>
                      <td className="py-2 px-2 text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-2 text-right">₹{unitPrice}</td>
                      <td className="py-2 px-2 text-right font-bold">₹{itemTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end border-t-2 border-forest-900 pt-3 mb-4">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-forest-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-forest-950">₹{orderConfirmed.subtotal}</span>
                </div>
                <div className="flex justify-between text-forest-700">
                  <span>Shipping:</span>
                  <span className="font-semibold text-emerald-800">
                    {orderConfirmed.shippingFee === 0 ? "FREE" : `₹${orderConfirmed.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-forest-950 border-t border-cream-300 pt-1 font-serif">
                  <span>Grand Total:</span>
                  <span className="text-emerald-900">₹{orderConfirmed.grandTotal}</span>
                </div>
                <p className="text-[10px] text-forest-500 italic text-right pt-0.5">
                  All prices inclusive of 5% GST.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-cream-200 pt-3 text-center text-[11px] text-forest-600">
              <p className="font-semibold text-forest-800">
                Thank you for choosing {siteConfig.name}!
              </p>
              <p>100% Pure, unadulterated estate spices delivered to your kitchen.</p>
              <p className="text-[10px] mt-1 text-forest-500">
                For queries, reach us on WhatsApp: {siteConfig.whatsappDisplayNumber || siteConfig.phone}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
