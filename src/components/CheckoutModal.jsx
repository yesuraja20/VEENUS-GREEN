"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
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

  if (!isCheckoutOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your full name (at least 2 characters).";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = "Please provide your street address, door no. or landmark.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city / town.";
    }

    const pincodeRegex = /^\d{6}$/;
    if (!formData.pincode.trim() || !pincodeRegex.test(formData.pincode.trim())) {
      newErrors.pincode = "Please enter a valid 6-digit postal pincode.";
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

  // WhatsApp Order Submission
  const handleWhatsAppCheckout = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
    const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);
    setOrderConfirmed({
      orderId,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      type: "WhatsApp",
    });

    clearCart();
  };

  // Cash On Delivery Submission
  const handleCodCheckout = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderId = "VG-" + Math.floor(100000 + Math.random() * 900000);
    setOrderConfirmed({
      orderId,
      date: new Date().toLocaleDateString("en-IN", {
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
                {orderConfirmed ? "Order Confirmation" : "Complete Your Spice Order"}
              </h3>
              <p className="text-xs text-gold-300 font-medium">
                {orderConfirmed
                  ? `Reference Order #${orderConfirmed.orderId}`
                  : "Verified Direct Farm Dispatch"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close checkout"
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
                Thank You, {formData.name}!
              </h4>
              <p className="text-xs sm:text-sm text-forest-800 mt-1.5 max-w-md mx-auto leading-relaxed">
                Your order <strong className="text-forest-950">#{orderConfirmed.orderId}</strong> has been received. Our team will pack your fresh spices in nitrogen-flushed pouches.
              </p>
            </div>

            {/* Delivery address & Summary review */}
            <div className="bg-white p-5 rounded-2xl border border-cream-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">Order Date:</span>
                <span className="font-bold text-forest-950">{orderConfirmed.date}</span>
              </div>
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">Mobile Contact:</span>
                <span className="font-bold text-forest-950">+91 {formData.phone}</span>
              </div>
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-forest-600">Ship To:</span>
                <span className="font-bold text-forest-950 text-right">
                  {formData.address}, {formData.city} - {formData.pincode}
                </span>
              </div>
              <div className="flex justify-between pt-1 font-serif text-sm font-bold text-forest-950">
                <span>Grand Total:</span>
                <span className="text-emerald-800">₹{grandTotal}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Continue Shopping
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
                <span>Track on WhatsApp</span>
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
                <span>Order Summary ({cartItems.length} Products)</span>
              </h4>

              <div className="divide-y divide-cream-100 max-h-40 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="py-2 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-forest-950 truncate">{item.name}</p>
                      <p className="text-[11px] text-emerald-800">
                        {item.tamilName} • {item.selectedWeight?.label} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-forest-950 flex-shrink-0">
                      ₹{item.selectedWeight?.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-xs">
                <span className="text-forest-700">Subtotal:</span>
                <span className="font-bold text-forest-950">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-forest-700">Shipping:</span>
                <span className="font-bold text-emerald-800">
                  {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-cream-200 flex items-center justify-between text-sm font-serif font-bold text-forest-950">
                <span>Grand Total:</span>
                <span className="text-emerald-900 text-base">₹{grandTotal}</span>
              </div>
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-700">
                Delivery Details
              </h4>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-forest-900 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-forest-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Senthil Kumar"
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
                  Mobile Number (10 Digits) <span className="text-rose-500">*</span>
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
                  Door No, Street & Landmark <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-forest-500 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. 45/A, Green Garden Street, Near Temple"
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
                    City / Town <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-forest-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Tirupur / Chennai"
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
                    Postal Pincode <span className="text-rose-500">*</span>
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
                  Order Notes / Packaging Request (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Please send extra fine grind for Salem Turmeric"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-cream-300 text-sm text-forest-950 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-4 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-cream-50 font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-300" />
                  <span>Send Order & Checkout via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCodCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-sm tracking-wide border border-gold-500/40 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Confirm Cash on Delivery Order (₹{grandTotal})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-forest-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                <span>Zero spam guarantee. Fast courier dispatch with tracking ID.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
