"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategoryCards from "../components/CategoryCards";
import ProductCatalog from "../components/ProductCatalog";
import AboutSection from "../components/AboutSection";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleSearchFocus = () => {
    const el = document.getElementById("product-search-input");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-cream-50">
      {/* Sticky Responsive Navbar */}
      <Navbar onSearchFocus={handleSearchFocus} />

      {/* Cinematic Hero Section */}
      <Hero />

      {/* Product Categories */}
      <CategoryCards onSelectCategory={handleCategorySelect} />

      {/* 15 Products Catalogue with Search & Filter */}
      <ProductCatalog
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* About Section: Tradition in Every Spice */}
      <AboutSection />

      {/* Why Choose Us: 6 Core Pillars */}
      <WhyChooseUs />

      {/* Testimonials: 4 Verified Cards */}
      <Testimonials />

      {/* Contact Section & Form */}
      <ContactSection />

      {/* Premium Footer */}
      <Footer onCategoryClick={handleCategorySelect} />
    </main>
  );
}
