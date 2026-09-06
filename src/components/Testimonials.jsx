"use client";

import React from "react";
import { Star, Quote, Sparkles, CheckCircle } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Meenakshi Sundaram",
      role: "Traditional Home Chef & Food Blogger",
      location: "Chennai, Tamil Nadu",
      rating: 5,
      review:
        "The Tellicherry Black Pepper and Salem Turmeric powder from Venus Green are truly unmatched. The moment you open the pouch, the aroma fills the whole kitchen. My rasam and vatha kuzhambu taste like my grandmother's cooking!",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Chef Rajesh Ramanathan",
      role: "Head Chef, Heritage Bistro",
      location: "Bengaluru, Karnataka",
      rating: 5,
      review:
        "As a restaurant chef, consistent spice quality is make-or-break. Their Green Cardamom pods are huge (true 8mm bold) with oily, pitch-black seeds inside. Sombu and Seeragam have zero dust. Phenomenal purity.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Ananya Iyer",
      role: "Ayurvedic Nutritionist",
      location: "Coimbatore, Tamil Nadu",
      rating: 5,
      review:
        "I test their turmeric regularly for high curcumin and found it genuine with zero synthetic color. The ginger and compounded asafoetida give immense therapeutic relief. WhatsApp ordering is lightning fast too!",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Karthik Subramanian",
      role: "Culinary Enthusiast",
      location: "Hyderabad, Telangana",
      rating: 5,
      review:
        "The packaging is superb—heavy duty aroma-lock zip pouches that actually work. The Kodaikanal Hill Garlic and Jaathipathiri (mace) elevated my weekend biryani to royal standards. Highly recommend Venus Green!",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-cream-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>Customer Experiences</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            Loved in Over 10,000 Kitchens
          </h2>
          <p className="mt-4 text-forest-800/80 text-sm sm:text-base leading-relaxed">
            Read real stories from home cooks, master chefs, and wellness advocates who trust our uncompromised spices.
          </p>
        </div>

        {/* 4 Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-cream-200/90 shadow-sm hover:shadow-luxury hover:border-gold-500/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Quote Icon & Stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-gold-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-cream-300" />
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-forest-850 leading-relaxed italic text-forest-900 font-light mb-6">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-cream-100 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-gold-400/40"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-serif text-sm font-bold text-forest-950 truncate">
                      {t.name}
                    </h3>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-forest-600 truncate">{t.role}</p>
                  <p className="text-[10px] text-forest-500/80">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
