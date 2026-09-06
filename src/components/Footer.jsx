"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "../config/siteConfig";
import { generateWhatsAppInquiryUrl } from "../utils/whatsapp";
import {
  Leaf,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  ArrowUp,
  ShieldCheck,
} from "lucide-react";

export default function Footer({ onCategoryClick }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-forest-950 text-cream-100 border-t border-forest-900 relative">
      {/* Top Banner inside Footer */}
      <div className="bg-forest-900/80 border-b border-forest-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-cream-50">
                Pure Natural Spices Guaranteed
              </h3>
              <p className="text-xs text-cream-300">
                100% unadulterated, estate-sourced, laboratory tested for purity.
              </p>
            </div>
          </div>

          <a
            href={generateWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-cream-50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-300" />
            <span>Order Directly via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500 text-forest-950 flex items-center justify-center shadow-gold-glow/20">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-cream-50 tracking-tight">
                {siteConfig.name}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-cream-300/80 leading-relaxed font-light max-w-sm">
              Bringing centuries-old South Indian spice heritage straight from organic estate hills to your kitchen. Sun-dried, stone-ground, and aroma-sealed with zero artificial fillers.
            </p>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-forest-900 hover:bg-gold-500 hover:text-forest-950 text-cream-200 flex items-center justify-center transition-all border border-forest-800"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-forest-900 hover:bg-gold-500 hover:text-forest-950 text-cream-200 flex items-center justify-center transition-all border border-forest-800"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-forest-900 hover:bg-gold-500 hover:text-forest-950 text-cream-200 flex items-center justify-center transition-all border border-forest-800"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={generateWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-xl bg-forest-900 hover:bg-emerald-600 hover:text-white text-emerald-400 flex items-center justify-center transition-all border border-forest-800"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-cream-200/80">
              <li>
                <a href="#hero" className="hover:text-gold-300 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-gold-300 transition-colors">
                  About Our Heritage
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-gold-300 transition-colors">
                  Product Categories
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-gold-300 transition-colors">
                  All Spices Catalogue
                </a>
              </li>
              <li>
                <a href="#why-choose-us" className="hover:text-gold-300 transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-gold-300 transition-colors">
                  Customer Reviews
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-gold-300 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Categories
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-cream-200/80">
              <li>
                <button
                  onClick={() => onCategoryClick && onCategoryClick("whole-spices")}
                  className="hover:text-gold-300 transition-colors text-left"
                >
                  Whole Spices (முழு மசாலா)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategoryClick && onCategoryClick("powdered-spices")}
                  className="hover:text-gold-300 transition-colors text-left"
                >
                  Powdered Spices (மசாலா தூள்)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategoryClick && onCategoryClick("cooking-essentials")}
                  className="hover:text-gold-300 transition-colors text-left"
                >
                  Cooking Essentials (சமையல் பொருட்கள்)
                </button>
              </li>
              <li className="pt-2 text-[11px] text-gold-400/80">
                Tellicherry Pepper • Salem Turmeric • Kodaikanal Garlic • Idukki Cardamom
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Reach Our Team
            </h4>
            <div className="space-y-2 text-xs text-cream-200/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span>{siteConfig.address.fullAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`} className="hover:text-gold-300">
                  {siteConfig.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href={generateWhatsAppInquiryUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300">
                  WhatsApp: {siteConfig.whatsappDisplayNumber}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-gold-300">
                  {siteConfig.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-400">
          <p>© 2026 {siteConfig.legalName}. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span>Pure Spices • Authentic Taste</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-400 flex items-center gap-1 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-[11px] font-semibold">Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
