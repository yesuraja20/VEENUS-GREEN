"use client";

import React, { useState } from "react";
import { siteConfig } from "../config/siteConfig";
import { generateWhatsAppInquiryUrl } from "../utils/whatsapp";
import { useLanguage } from "../context/LanguageContext";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppFloating() {
  const { t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <aside aria-label={t("floating.assistanceLabel") || "WhatsApp quick assistance"} className="fixed bottom-6 right-6 z-40 flex items-center gap-3 flex-row-reverse">
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-forest-900 text-cream-50 text-xs font-semibold shadow-xl border border-gold-400/30 animate-fade-in">
          <span>{t("floating.tooltipText") || t("floating.chatWithUs") || "Need help or want to order via WhatsApp?"}</span>
          <button
            onClick={() => setShowTooltip(false)}
            aria-label={t("floating.dismissTooltip") || "Dismiss assistance tooltip"}
            className="text-cream-400 hover:text-white ml-1 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={generateWhatsAppInquiryUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("floating.chatWhatsApp") || "Chat on WhatsApp"}
        className="relative group w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
      >
        {/* Pulse effect rings */}
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25 group-hover:opacity-40" />
        <MessageCircle className="w-7 h-7 relative z-10" />
      </a>
    </aside>
  );
}

