"use client";

import React from "react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export default function Toast() {
  const { toast } = useCart();
  const { t } = useLanguage();

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  const message =
    typeof toast.message === "object" && toast.message.key
      ? t(toast.message.key, toast.message.params) || toast.message.fallback
      : toast.message;

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-fade-in max-w-sm w-full pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-2xl border transition-all duration-300 ${
          isSuccess
            ? "bg-forest-900/95 text-cream-50 border-gold-400/40 shadow-gold-glow/20"
            : isError
            ? "bg-rose-950/95 text-rose-50 border-rose-500/40"
            : "bg-forest-800/95 text-cream-50 border-emerald-500/30"
        } backdrop-blur-md`}
      >
        <div className="flex-shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-gold-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-emerald-300" />}
        </div>
        <div className="text-sm font-medium flex-1 tracking-wide">{message}</div>
      </div>
    </div>
  );
}
