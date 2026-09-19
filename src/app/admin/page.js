"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "../../context/StoreContext";
import { siteConfig } from "../../config/siteConfig";
import {
  isSupabaseConfigured,
  uploadImageToSupabase,
} from "../../lib/supabaseClient";
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  Package,
  Image as ImageIcon,
  DollarSign,
  MessageSquare,
  ShoppingBag,
  ExternalLink,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Save,
  Upload,
  RefreshCw,
  Phone,
  MessageCircle,
  MapPin,
  AlertCircle,
  TrendingUp,
  CreditCard,
  ChevronRight,
  Eye,
  Sliders,
  Check,
  Database,
  ArrowUpRight,
} from "lucide-react";

export default function AdminPage() {
  const {
    products,
    siteSettings,
    inquiries,
    orders,
    isSupabaseActive,
    updateProductPrice,
    updateProductImage,
    updateProductDetails,
    updateSiteImage,
    updateInquiryStatus,
    updateOrderStatus,
    syncInitialProductsToSupabase,
    refreshData,
  } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation Tab
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'pricing' | 'images' | 'inquiries' | 'orders' | 'settings'

  // Product Filter & Edit State
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Image Management State
  const [heroImgUrl, setHeroImgUrl] = useState("");
  const [aboutImgUrl, setAboutImgUrl] = useState("");
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [uploadingState, setUploadingState] = useState(null);

  // Inquiries Filter & Search
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryFilter, setInquiryFilter] = useState("all");

  // Orders Filter & Search
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  // UI Toast notification inside Admin
  const [adminToast, setAdminToast] = useState(null);
  const showToast = (message, type = "success") => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Check existing session
  useEffect(() => {
    const session = sessionStorage.getItem("venus_green_admin_logged_in");
    if (session === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Initialize input fields from siteSettings
  useEffect(() => {
    if (siteSettings?.heroImage?.url) {
      setHeroImgUrl(siteSettings.heroImage.url);
    }
    if (siteSettings?.aboutImage?.url) {
      setAboutImgUrl(siteSettings.aboutImage.url);
    }
  }, [siteSettings]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    const envEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@venusgreen.com";
    const envPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "venusgreen@2026";

    // Allow standard admin credentials or .env match
    if (
      (authEmail.trim().toLowerCase() === "admin@venusgreen.com" && authPassword === "venusgreen@2026") ||
      (authEmail.trim() === envEmail && authPassword === envPass)
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem("venus_green_admin_logged_in", "true");
      setAuthError("");
      showToast("Welcome back to Venus Green Admin Portal!");
    } else {
      setAuthError("Invalid credentials. Please verify email and password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("venus_green_admin_logged_in");
  };

  // Sync / Seed Default Products into Supabase
  const [isSeeding, setIsSeSeeding] = useState(false);
  const handleSeedDatabase = async () => {
    if (!isSupabaseActive) {
      showToast("Supabase is not configured yet. Add keys to .env.local first.", "error");
      return;
    }
    setIsSeSeeding(true);
    try {
      const count = await syncInitialProductsToSupabase();
      showToast(`Successfully seeded ${count} products into Supabase!`);
    } catch (err) {
      showToast(`Seeding failed: ${err.message}`, "error");
    } finally {
      setIsSeSeeding(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      const q = productSearch.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.englishName && p.englishName.toLowerCase().includes(q)) ||
        (p.tamilName && p.tamilName.includes(q));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, productSearch]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = inquiryFilter === "all" || inq.status === inquiryFilter;
      const q = inquirySearch.toLowerCase();
      const matchesSearch =
        !q ||
        (inq.name && inq.name.toLowerCase().includes(q)) ||
        (inq.mobile && inq.mobile.includes(q)) ||
        (inq.message && inq.message.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [inquiries, inquiryFilter, inquirySearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus = orderFilter === "all" || ord.status === orderFilter;
      const q = orderSearch.toLowerCase();
      const matchesSearch =
        !q ||
        (ord.id && ord.id.toLowerCase().includes(q)) ||
        (ord.customer_name && ord.customer_name.toLowerCase().includes(q)) ||
        (ord.phone && ord.phone.includes(q)) ||
        (ord.city && ord.city.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  // Analytics Stats
  const stats = useMemo(() => {
    const totalOrdersCount = orders.length;
    const paidOrders = orders.filter(
      (o) => (o.payment_status || o.paymentStatus) === "paid"
    );
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.grand_total || o.grandTotal) || 0),
      0
    );
    const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;
    return {
      totalOrdersCount,
      paidOrdersCount: paidOrders.length,
      totalRevenue,
      newInquiriesCount,
      totalProductsCount: products.length,
    };
  }, [orders, inquiries, products]);

  // Image Upload helper to Supabase Storage
  const handleFileUpload = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseActive) {
      showToast("Connect Supabase to upload local images directly. Meanwhile you can paste any public image URL!", "info");
      return;
    }

    setUploadingState(target);
    try {
      const publicUrl = await uploadImageToSupabase(file, target);
      if (target === "hero") {
        setHeroImgUrl(publicUrl);
        await updateSiteImage("hero", publicUrl);
        showToast("Hero image updated via Supabase Storage!");
      } else if (target === "about") {
        setAboutImgUrl(publicUrl);
        await updateSiteImage("about", publicUrl);
        showToast("About image updated via Supabase Storage!");
      } else if (target.startsWith("product-")) {
        const prodId = target.replace("product-", "");
        await updateProductImage(prodId, publicUrl);
        if (editingProduct && editingProduct.id === prodId) {
          setEditingProduct((prev) => ({ ...prev, image: publicUrl }));
        }
        showToast("Product image updated via Supabase Storage!");
      }
    } catch (err) {
      showToast(`Upload failed: ${err.message}`, "error");
    } finally {
      setUploadingState(null);
    }
  };

  // =========================================================================
  // 1. LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-forest-950 px-4 py-12 relative overflow-hidden">
        {/* Background glow & accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-forest-900 border border-gold-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-cream-50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold-500 text-forest-950 flex items-center justify-center mx-auto mb-4 font-serif font-black text-2xl shadow-gold-glow">
              VG
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream-50">
              Venus Green Admin
            </h1>
            <p className="text-xs text-gold-300/80 mt-1 uppercase tracking-widest font-semibold">
              Management & Control Suite
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gold-300/90 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@venusgreen.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-forest-950 border border-forest-700 text-sm text-cream-50 placeholder-forest-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gold-300/90 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-forest-950 border border-forest-700 text-sm text-cream-50 placeholder-forest-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl gold-gradient-bg text-forest-950 font-bold text-sm tracking-wider uppercase shadow-gold-glow hover:brightness-110 active:scale-95 transition-all mt-6"
            >
              Sign In to Admin
            </button>
          </form>

          {/* Quick Helper Credentials */}
          <div className="mt-8 pt-6 border-t border-forest-800 text-center">
            <div className="p-3 rounded-xl bg-forest-950/60 border border-forest-800 text-[11px] text-cream-300/80 leading-relaxed">
              <span className="text-gold-300 font-bold">Default Credentials:</span>
              <div className="font-mono text-cream-200 mt-1">
                admin@venusgreen.com / venusgreen@2026
              </div>
            </div>

            <div className="mt-4">
              <Link
                href="/"
                className="text-xs text-gold-400 hover:text-gold-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>Return to Storefront</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col font-sans">
      {/* Toast */}
      {adminToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl bg-forest-900 text-cream-50 border border-gold-500/40 text-sm font-semibold flex items-center gap-2.5 animate-bounce-short">
          <CheckCircle2 className="w-4 h-4 text-gold-400" />
          <span>{adminToast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-forest-950 text-cream-50 border-b border-forest-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-gold-500 text-forest-950 font-serif font-black flex items-center justify-center text-base">
              VG
            </div>
            <div>
              <span className="font-serif font-bold text-base tracking-wide text-cream-50">
                Venus Green
              </span>
              <span className="ml-2 text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-800 text-gold-300 font-bold">
                Admin Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase Status Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isSupabaseActive
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-950/60 border-amber-500/40 text-amber-300"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {isSupabaseActive ? "Supabase Live" : "Local / Offline Mode"}
              </span>
            </div>

            {/* Visit Store */}
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-800 text-cream-200 hover:text-white border border-forest-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Website</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-cream-400 hover:text-rose-400 hover:bg-forest-900 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 py-1 no-scrollbar border-t border-forest-900">
          {[
            { id: "dashboard", label: "Overview", icon: TrendingUp },
            { id: "pricing", label: "Products & Pricing", icon: DollarSign, badge: products.length },
            { id: "images", label: "Website Images", icon: ImageIcon },
            { id: "inquiries", label: "Inquiries", icon: MessageSquare, badge: inquiries.filter((i) => i.status === "new").length },
            { id: "orders", label: "Customer Orders", icon: ShoppingBag, badge: orders.length },
            { id: "settings", label: "Supabase & Setup", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-gold-500 text-forest-950 shadow-sm"
                    : "text-cream-300 hover:text-white hover:bg-forest-900/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-forest-950 text-gold-300"
                        : "bg-forest-800 text-cream-100"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-forest-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-serif font-black text-forest-950 mt-1">
                    {stats.totalOrdersCount}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    {stats.paidOrdersCount} Paid Online
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-forest-600">
                    Gross Volume
                  </p>
                  <p className="text-2xl font-serif font-black text-forest-950 mt-1">
                    ₹{stats.totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-forest-500 font-semibold mt-1">
                    Orders across all channels
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-forest-600">
                    Customer Inquiries
                  </p>
                  <p className="text-2xl font-serif font-black text-forest-950 mt-1">
                    {inquiries.length}
                  </p>
                  <p className="text-[11px] text-amber-700 font-semibold mt-1">
                    {stats.newInquiriesCount} Pending Response
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-forest-600">
                    Live Products
                  </p>
                  <p className="text-2xl font-serif font-black text-forest-950 mt-1">
                    {stats.totalProductsCount}
                  </p>
                  <p className="text-[11px] text-forest-500 font-semibold mt-1">
                    All prices dynamic
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-forest-900 rounded-3xl p-6 sm:p-8 text-cream-50 border border-gold-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-cream-50">
                  Ready to manage your store?
                </h3>
                <p className="text-xs sm:text-sm text-cream-200/80 mt-1 max-w-xl">
                  Update spice prices, change the hero banner, review recent customer orders, or sync your 15 catalog spices directly to your Supabase database.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("pricing")}
                  className="px-5 py-2.5 rounded-xl gold-gradient-bg text-forest-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Edit Pricing</span>
                </button>
                <button
                  onClick={() => setActiveTab("images")}
                  className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-100 font-bold text-xs uppercase tracking-wider border border-forest-700 transition-all flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Update Images</span>
                </button>
              </div>
            </div>

            {/* Recent Inquiries & Orders preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-serif text-base font-bold text-forest-950 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gold-600" />
                    <span>Recent Customer Orders</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-forest-700 hover:text-forest-950 font-semibold flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-forest-500 italic py-6 text-center">
                    No orders recorded yet. As customers place orders online or via COD, they will appear here.
                  </p>
                ) : (
                  <div className="divide-y divide-cream-200">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-forest-950">
                            {ord.customer_name || ord.customerName}
                          </p>
                          <p className="text-[11px] text-forest-600">
                            #{ord.id} • {ord.city || "Tamil Nadu"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-forest-950">
                            ₹{ord.grand_total || ord.grandTotal}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (ord.payment_status || ord.paymentStatus) === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {(ord.payment_status || ord.paymentStatus) === "paid"
                              ? "Paid"
                              : "COD / Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Inquiries */}
              <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-serif text-base font-bold text-forest-950 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Recent Inquiries</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab("inquiries")}
                    className="text-xs text-forest-700 hover:text-forest-950 font-semibold flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <p className="text-xs text-forest-500 italic py-6 text-center">
                    No customer inquiries submitted yet. When a customer sends a message on the contact section, it will be stored here.
                  </p>
                ) : (
                  <div className="divide-y divide-cream-200">
                    {inquiries.slice(0, 5).map((inq) => (
                      <div key={inq.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="pr-4 min-w-0">
                          <p className="font-bold text-forest-950">{inq.name}</p>
                          <p className="text-[11px] text-forest-600 truncate max-w-xs">
                            {inq.message}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inq.status === "new"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {inq.status || "New"}
                          </span>
                          <p className="text-[10px] text-forest-500 mt-0.5">
                            +91 {inq.mobile}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRODUCTS & DYNAMIC PRICING */}
        {/* ========================================================================= */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-cream-300 shadow-sm">
              <div>
                <h3 className="font-serif text-xl font-bold text-forest-950">
                  Products & Dynamic Pricing Details
                </h3>
                <p className="text-xs text-forest-700 mt-1">
                  Adjust product prices for each weight tier (100g, 250g, 500g, 1kg), update photos, and modify badges. Changes reflect live on the website!
                </p>
              </div>

              {/* Seed Button */}
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 disabled:opacity-50 text-gold-300 font-bold text-xs border border-gold-500/30 flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                <span>{isSeeding ? "Syncing..." : "Sync 15 Spices to Supabase"}</span>
              </button>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-forest-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by English or Tamil name..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-300 rounded-xl text-xs text-forest-950 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                />
              </div>

              <div className="flex gap-2">
                {["all", "whole-spices", "pure-powders", "cooking-essentials"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      selectedCategory === cat
                        ? "bg-forest-900 text-gold-300"
                        : "bg-white text-forest-800 border border-cream-300 hover:bg-cream-200"
                    }`}
                  >
                    {cat === "all" ? "All Spices" : cat.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5">
                    {/* Header with image thumbnail */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0 border border-cream-200 relative group">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-600">
                          {prod.categoryLabel || prod.category}
                        </span>
                        <h4 className="font-serif text-base font-bold text-forest-950 truncate">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-emerald-800 font-medium">
                          {prod.tamilName} • {prod.englishName}
                        </p>
                        {prod.badge && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-900">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Weight & Price Tiers */}
                    <div className="space-y-2 pt-2 border-t border-cream-200">
                      <p className="text-[11px] uppercase tracking-wider font-bold text-forest-700">
                        Weights & Prices:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {prod.weights?.map((w, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-cream-50 border border-cream-200 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-forest-800">{w.label}</span>
                            <span className="font-bold text-forest-950">₹{w.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-cream-50 border-t border-cream-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setEditingProduct({ ...prod })}
                      className="flex-1 py-2 px-3 rounded-lg bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit Price & Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Edit Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cream-300 my-6">
                  <div className="flex items-center justify-between border-b border-cream-200 pb-4 mb-6">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-forest-950">
                        Edit Spice: {editingProduct.name}
                      </h3>
                      <p className="text-xs text-forest-600">
                        Update weights, prices, badges and product image.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-forest-400 hover:text-forest-900 font-bold text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-5 text-xs">
                    {/* Image URL & Upload */}
                    <div>
                      <label className="block font-bold text-forest-900 mb-1">
                        Product Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingProduct.image}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, image: e.target.value })
                          }
                          className="flex-1 px-3.5 py-2 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                        <label className="px-3 py-2 rounded-xl bg-forest-900 text-gold-300 cursor-pointer hover:bg-forest-800 flex items-center gap-1 font-bold whitespace-nowrap">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, `product-${editingProduct.id}`)
                            }
                          />
                        </label>
                      </div>
                      {editingProduct.image && (
                        <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-cream-300 bg-cream-100">
                          <img
                            src={editingProduct.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    <div>
                      <label className="block font-bold text-forest-900 mb-1">
                        Product Badge (e.g. Best Seller, Daily Essential, Farm Direct)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.badge || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, badge: e.target.value })
                        }
                        placeholder="e.g. Best Seller"
                        className="w-full px-3.5 py-2 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    </div>

                    {/* Weights & Prices Editor */}
                    <div>
                      <label className="block font-bold text-forest-900 mb-2">
                        Pricing per Weight Tier:
                      </label>
                      <div className="space-y-3">
                        {editingProduct.weights?.map((w, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-cream-50 rounded-xl border border-cream-200 grid grid-cols-12 gap-3 items-center"
                          >
                            <div className="col-span-4">
                              <span className="text-[10px] text-forest-500 block">Weight</span>
                              <input
                                type="text"
                                value={w.label}
                                onChange={(e) => {
                                  const updated = [...editingProduct.weights];
                                  updated[idx] = { ...updated[idx], label: e.target.value };
                                  setEditingProduct({ ...editingProduct, weights: updated });
                                }}
                                className="w-full px-2 py-1 bg-white border border-cream-300 rounded font-semibold text-forest-950"
                              />
                            </div>
                            <div className="col-span-4">
                              <span className="text-[10px] text-forest-500 block">Price (₹)</span>
                              <input
                                type="number"
                                value={w.price}
                                onChange={(e) => {
                                  const updated = [...editingProduct.weights];
                                  updated[idx] = {
                                    ...updated[idx],
                                    price: Number(e.target.value),
                                  };
                                  setEditingProduct({ ...editingProduct, weights: updated });
                                }}
                                className="w-full px-2 py-1 bg-white border border-cream-300 rounded font-bold text-emerald-800"
                              />
                            </div>
                            <div className="col-span-4">
                              <span className="text-[10px] text-forest-500 block">Discount Pill</span>
                              <input
                                type="text"
                                value={w.badge || ""}
                                onChange={(e) => {
                                  const updated = [...editingProduct.weights];
                                  updated[idx] = { ...updated[idx], badge: e.target.value };
                                  setEditingProduct({ ...editingProduct, weights: updated });
                                }}
                                placeholder="e.g. Save ₹29"
                                className="w-full px-2 py-1 bg-white border border-cream-300 rounded text-forest-950"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Short Description */}
                    <div>
                      <label className="block font-bold text-forest-900 mb-1">
                        Short Description
                      </label>
                      <textarea
                        rows={2}
                        value={editingProduct.shortDescription || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            shortDescription: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-cream-50 border border-cream-300 text-forest-950"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 pt-4 border-t border-cream-200 flex justify-end gap-3">
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl border border-cream-300 text-forest-700 font-bold text-xs hover:bg-cream-100"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSavingProduct}
                      onClick={async () => {
                        setIsSavingProduct(true);
                        try {
                          await updateProductDetails(editingProduct);
                          showToast(`Successfully updated ${editingProduct.name}!`);
                          setEditingProduct(null);
                        } catch (err) {
                          showToast(`Failed to update: ${err.message}`, "error");
                        } finally {
                          setIsSavingProduct(false);
                        }
                      }}
                      className="px-6 py-2 rounded-xl gold-gradient-bg text-forest-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:brightness-110"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingProduct ? "Saving..." : "Save Product Details"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WEBSITE IMAGES & MEDIA MANAGER */}
        {/* ========================================================================= */}
        {activeTab === "images" && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-forest-950">
                Website Images & Visual Identity
              </h3>
              <p className="text-xs text-forest-700 mt-1">
                Customize your website's hero background banner and about section craftsmanship visual. You can either paste high-resolution image URLs or upload directly to Supabase Storage.
              </p>
            </div>

            {/* 1. HERO BANNER IMAGE */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-cream-300 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-forest-950">
                      Hero Section Background Image
                    </h4>
                    <p className="text-xs text-forest-600">
                      The full-screen cinematic banner displayed at the top of your homepage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Preview */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-cream-300 bg-forest-950">
                <img
                  src={heroImgUrl || siteSettings?.heroImage?.url}
                  alt="Hero Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent flex items-end p-4">
                  <span className="px-3 py-1 rounded-full bg-forest-900/90 text-gold-300 text-xs font-bold border border-gold-400/30">
                    Live Hero Banner Preview
                  </span>
                </div>
              </div>

              {/* URL & Upload Inputs */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-forest-900 uppercase tracking-wider">
                  Hero Image URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={heroImgUrl}
                    onChange={(e) => setHeroImgUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-forest-950 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  />
                  <label className="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadingState === "hero" ? "Uploading..." : "Upload File"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "hero")}
                    />
                  </label>
                  <button
                    onClick={async () => {
                      setIsSavingHero(true);
                      try {
                        await updateSiteImage("hero", heroImgUrl, "Traditional Indian Spices");
                        showToast("Hero image successfully updated!");
                      } catch (err) {
                        showToast(`Failed: ${err.message}`, "error");
                      } finally {
                        setIsSavingHero(false);
                      }
                    }}
                    disabled={isSavingHero}
                    className="px-6 py-2.5 rounded-xl gold-gradient-bg text-forest-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:brightness-110"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingHero ? "Saving..." : "Apply to Hero"}</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[11px] text-forest-600 font-semibold mr-2">
                    Curated Presets:
                  </span>
                  {[
                    {
                      label: "Spices Dark Wood",
                      url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=2000&q=85",
                    },
                    {
                      label: "Clay Bowls Market",
                      url: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=2000&q=85",
                    },
                    {
                      label: "Kerala Farm Harvest",
                      url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=2000&q=85",
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setHeroImgUrl(preset.url)}
                      className="inline-block mr-2 mt-1 px-2.5 py-1 bg-cream-100 hover:bg-gold-100 text-forest-800 text-[11px] rounded-lg border border-cream-300 font-medium transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. ABOUT SECTION VISUAL */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-cream-300 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-forest-950">
                      About Section Visual (Stone Ground & Heritage Craft)
                    </h4>
                    <p className="text-xs text-forest-600">
                      The feature visual displayed alongside the 4 heritage pillars in the About section.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Preview */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-cream-300 bg-forest-950">
                <img
                  src={aboutImgUrl || siteSettings?.aboutImage?.url}
                  alt="About Visual Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent flex items-end p-4">
                  <span className="px-3 py-1 rounded-full bg-forest-900/90 text-gold-300 text-xs font-bold border border-gold-400/30">
                    Live About Section Visual Preview
                  </span>
                </div>
              </div>

              {/* URL & Upload Inputs */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-forest-900 uppercase tracking-wider">
                  About Section Image URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={aboutImgUrl}
                    onChange={(e) => setAboutImgUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-forest-950 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  />
                  <label className="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadingState === "about" ? "Uploading..." : "Upload File"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "about")}
                    />
                  </label>
                  <button
                    onClick={async () => {
                      setIsSavingAbout(true);
                      try {
                        await updateSiteImage("about", aboutImgUrl, "Heritage spice craftsmanship");
                        showToast("About visual successfully updated!");
                      } catch (err) {
                        showToast(`Failed: ${err.message}`, "error");
                      } finally {
                        setIsSavingAbout(false);
                      }
                    }}
                    disabled={isSavingAbout}
                    className="px-6 py-2.5 rounded-xl gold-gradient-bg text-forest-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:brightness-110"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingAbout ? "Saving..." : "Apply to About"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CUSTOMER INQUIRIES */}
        {/* ========================================================================= */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-forest-950">
                  Customer Inquiries & Contact Submissions
                </h3>
                <p className="text-xs text-forest-700 mt-1">
                  Every form filled out on your website contact section is stored here in your Supabase database.
                </p>
              </div>

              <div className="flex gap-2">
                {["all", "new", "in_progress", "resolved"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInquiryFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      inquiryFilter === st
                        ? "bg-forest-900 text-gold-300"
                        : "bg-white text-forest-800 border border-cream-300 hover:bg-cream-200"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiries List */}
            {filteredInquiries.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-cream-300">
                <MessageSquare className="w-12 h-12 text-forest-300 mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold text-forest-950">
                  No Inquiries Found
                </h4>
                <p className="text-xs text-forest-600 mt-1">
                  When visitors submit inquiries on the contact form, they will immediately appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-serif text-base font-bold text-forest-950">
                          {inq.name}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inq.status === "new"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : inq.status === "in_progress"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {inq.status || "New"}
                        </span>
                        <span className="text-[11px] text-forest-400">
                          {inq.created_at
                            ? new Date(inq.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recent"}
                        </span>
                      </div>

                      <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-forest-900 leading-relaxed font-sans">
                        "{inq.message}"
                      </div>
                    </div>

                    {/* Actions & Status Changer */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2.5 w-full sm:w-auto">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <a
                          href={`https://wa.me/91${inq.mobile.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-cream-50 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:+91${inq.mobile.replace(/\D/g, "")}`}
                          className="px-3 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>+91 {inq.mobile}</span>
                        </a>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={inq.status || "new"}
                        onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-cream-100 border border-cream-300 text-xs text-forest-900 font-semibold focus:outline-none"
                      >
                        <option value="new">Mark as New</option>
                        <option value="in_progress">Mark as In Progress</option>
                        <option value="resolved">Mark as Resolved</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CUSTOMER ORDERS */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-forest-950">
                  Customer Orders & Payment Records
                </h3>
                <p className="text-xs text-forest-700 mt-1">
                  Track orders placed via Razorpay (Paid Online), Cash on Delivery (COD), or WhatsApp.
                </p>
              </div>

              <div className="flex gap-2">
                {["all", "received", "processing", "shipped", "delivered"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      orderFilter === st
                        ? "bg-forest-900 text-gold-300"
                        : "bg-white text-forest-800 border border-cream-300 hover:bg-cream-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-cream-300">
                <ShoppingBag className="w-12 h-12 text-forest-300 mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold text-forest-950">
                  No Orders Found
                </h4>
                <p className="text-xs text-forest-600 mt-1">
                  When a customer completes a checkout, full customer and delivery info will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const isPaid = (ord.payment_status || ord.paymentStatus) === "paid";
                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-cream-300 shadow-sm space-y-4"
                    >
                      {/* Top row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-forest-950">
                            #{ord.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {isPaid ? "PAID ONLINE" : "PENDING (COD)"}
                          </span>
                          <span className="text-xs text-forest-600 font-medium">
                            {ord.payment_method || ord.paymentMethod}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-forest-600 font-semibold">
                            Status:
                          </span>
                          <select
                            value={ord.status || "received"}
                            onChange={(e) =>
                              updateOrderStatus(ord.id, { status: e.target.value })
                            }
                            className="px-2.5 py-1 rounded-lg bg-cream-100 border border-cream-300 text-xs font-bold text-forest-900 focus:outline-none"
                          >
                            <option value="received">Received</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Customer Information */}
                        <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-forest-500 tracking-wider">
                            Customer Details
                          </span>
                          <p className="font-bold text-forest-950 text-sm">
                            {ord.customer_name || ord.customerName}
                          </p>
                          <p className="text-forest-700">+91 {ord.phone}</p>
                          {ord.payment_id && (
                            <p className="text-[10px] font-mono text-emerald-700 truncate">
                              PayID: {ord.payment_id}
                            </p>
                          )}
                        </div>

                        {/* Shipping Address */}
                        <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-forest-500 tracking-wider">
                            Delivery Address
                          </span>
                          <p className="text-forest-900 font-medium leading-relaxed">
                            {ord.address}, {ord.city} - {ord.pincode}
                          </p>
                          {ord.notes && (
                            <p className="text-[11px] text-forest-600 italic">
                              Note: {ord.notes}
                            </p>
                          )}
                        </div>

                        {/* Purchased Items & Total */}
                        <div className="p-3.5 rounded-xl bg-forest-950 text-cream-50 border border-forest-800 space-y-2 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">
                              Order Summary
                            </span>
                            <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                              {(ord.items || []).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-[11px] text-cream-200"
                                >
                                  <span>
                                    {item.quantity} × {item.name} ({item.selectedWeight?.label})
                                  </span>
                                  <span className="font-bold text-cream-50">
                                    ₹{item.price * item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-forest-800 flex justify-between font-bold text-sm">
                            <span className="text-gold-300">Grand Total:</span>
                            <span className="text-gold-400">
                              ₹{ord.grand_total || ord.grandTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SUPABASE & PAYMENT GATEWAY SETUP */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-cream-300 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-forest-950">
                Supabase Database & Payment Gateway Setup Guide
              </h3>
              <p className="text-xs sm:text-sm text-forest-700 leading-relaxed">
                Venus Green is fully architected to sync directly with your Supabase database and Razorpay payment gateway. Below are the steps to connect your live credentials.
              </p>
            </div>

            {/* Checklist Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supabase Status */}
              <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isSupabaseActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-forest-950">
                      Supabase Database
                    </h4>
                    <p className="text-xs text-forest-600">
                      {isSupabaseActive ? "Connected & Active" : "Action Required"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-forest-800">
                  <p>
                    1. Create a free project at{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-600 underline font-bold"
                    >
                      supabase.com
                    </a>
                  </p>
                  <p>
                    2. Go to <strong>SQL Editor</strong> and execute the code in{" "}
                    <code className="bg-cream-100 px-1 py-0.5 rounded font-mono text-forest-900">
                      supabase-schema.sql
                    </code>
                  </p>
                  <p>
                    3. Copy your <strong>Project URL</strong> and <strong>anon key</strong> into your{" "}
                    <code className="bg-cream-100 px-1 py-0.5 rounded font-mono text-forest-900">
                      .env.local
                    </code>{" "}
                    file.
                  </p>
                </div>

                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="w-full py-3 rounded-xl gold-gradient-bg text-forest-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                  <span>Sync 15 Default Products to Supabase</span>
                </button>
              </div>

              {/* Razorpay Status */}
              <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-forest-950">
                      Razorpay Payment Gateway
                    </h4>
                    <p className="text-xs text-forest-600">
                      UPI, GPay, PhonePe, Cards & NetBanking
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-forest-800">
                  <p>
                    1. Create an account at{" "}
                    <a
                      href="https://razorpay.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-600 underline font-bold"
                    >
                      razorpay.com
                    </a>
                  </p>
                  <p>
                    2. Navigate to <strong>Settings</strong> → <strong>API Keys</strong> → <strong>Generate Key</strong>.
                  </p>
                  <p>
                    3. Add{" "}
                    <code className="bg-cream-100 px-1 py-0.5 rounded font-mono text-forest-900">
                      NEXT_PUBLIC_RAZORPAY_KEY_ID
                    </code>{" "}
                    and{" "}
                    <code className="bg-cream-100 px-1 py-0.5 rounded font-mono text-forest-900">
                      RAZORPAY_KEY_SECRET
                    </code>{" "}
                    into <code className="bg-cream-100 px-1 py-0.5 rounded font-mono text-forest-900">.env.local</code>.
                  </p>
                </div>

                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-[11px] text-forest-700 leading-relaxed">
                  <strong>Simulated Mode Active:</strong> Until live keys are entered, test orders simulate successfully so customers can test the checkout workflow without errors!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
