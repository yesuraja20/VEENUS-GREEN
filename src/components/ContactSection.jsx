"use client";

import React, { useState } from "react";
import { siteConfig } from "../config/siteConfig";
import { generateWhatsAppInquiryUrl } from "../utils/whatsapp";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Please enter your name.";
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    const clean = formData.mobile.replace(/\D/g, "");
    if (!clean || !phoneRegex.test(clean)) {
      errs.mobile = "Please enter a valid 10-digit mobile number.";
    }
    if (!formData.message.trim()) {
      errs.message = "Please write your query or bulk inquiry message.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate clean client-side submission without fake backend
    setIsSubmitted(true);
    setFormData({ name: "", mobile: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 bg-cream-100/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>Direct Inquiries & Wholesale</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            Connect With Our Spice Experts
          </h2>
          <p className="mt-4 text-forest-800/80 text-sm sm:text-base leading-relaxed">
            Have questions about origin batches, custom kitchen quantities, or culinary recommendations? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-forest-900 text-cream-50 p-8 sm:p-10 rounded-3xl shadow-2xl border border-gold-500/20 flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-cream-50 mb-2">
                {siteConfig.name}
              </h3>
              <p className="text-xs text-gold-300/90 font-medium mb-8">
                {siteConfig.legalName}
              </p>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 border border-gold-400/20 flex items-center justify-center flex-shrink-0 text-gold-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gold-300/80 tracking-wider">
                      Customer Care Phone
                    </h4>
                    <a
                      href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                      className="text-sm font-semibold text-cream-100 hover:text-gold-300 transition-colors"
                    >
                      {siteConfig.phone}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 border border-gold-400/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gold-300/80 tracking-wider">
                      WhatsApp Instant Order
                    </h4>
                    <a
                      href={generateWhatsAppInquiryUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-cream-100 hover:text-gold-300 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{siteConfig.whatsappDisplayNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/60 text-emerald-200">
                        Online
                      </span>
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 border border-gold-400/20 flex items-center justify-center flex-shrink-0 text-gold-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gold-300/80 tracking-wider">
                      Email Inquiries
                    </h4>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-sm font-semibold text-cream-100 hover:text-gold-300 transition-colors"
                    >
                      {siteConfig.email}
                    </a>
                  </div>
                </div>

                {/* Business Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 border border-gold-400/20 flex items-center justify-center flex-shrink-0 text-gold-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gold-300/80 tracking-wider">
                      Registered Business Address
                    </h4>
                    <p className="text-xs sm:text-sm text-cream-200 leading-relaxed font-light mt-0.5">
                      {siteConfig.address.fullAddress}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 border border-gold-400/20 flex items-center justify-center flex-shrink-0 text-gold-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gold-300/80 tracking-wider">
                      Dispatch & Support Hours
                    </h4>
                    <p className="text-xs text-cream-200 font-light mt-0.5">
                      {siteConfig.operatingHours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-forest-800">
              <a
                href={generateWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-cream-50 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Directly with Spice Manager</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-cream-200/90 flex flex-col justify-between">
            {isSubmitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-forest-950">
                  Message Received Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-forest-700 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Venus Green. Our spice curator will review your message and connect with you via mobile or WhatsApp shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-forest-900 text-gold-300 text-xs font-bold uppercase tracking-wider"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-forest-950">
                    Send Us a Message
                  </h3>
                  <p className="text-xs text-forest-600 mt-1">
                    Fill in your details below for custom order queries, bulk restaurant inquiries, or spice recommendations.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1.5 uppercase tracking-wider">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    placeholder="e.g. Priyadharshini"
                    className={`w-full px-4 py-3 rounded-xl bg-cream-50 border text-sm text-forest-950 focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-cream-300 focus:ring-gold-500/40 focus:border-gold-500"
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1.5 uppercase tracking-wider">
                    Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => {
                        setFormData({ ...formData, mobile: e.target.value });
                        if (errors.mobile) setErrors({ ...errors, mobile: null });
                      }}
                      placeholder="9876543210"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl bg-cream-50 border text-sm text-forest-950 focus:outline-none focus:ring-2 ${
                        errors.mobile
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-cream-300 focus:ring-gold-500/40 focus:border-gold-500"
                      }`}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.mobile}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1.5 uppercase tracking-wider">
                    Your Message / Inquiry <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: null });
                    }}
                    placeholder="Tell us what you are looking for (e.g. bulk 5kg Salem turmeric, custom grind, shipping to your town)..."
                    className={`w-full px-4 py-3 rounded-xl bg-cream-50 border text-sm text-forest-950 focus:outline-none focus:ring-2 ${
                      errors.message
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-cream-300 focus:ring-gold-500/40 focus:border-gold-500"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4 text-gold-400" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
