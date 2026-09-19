"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { products as defaultProducts } from "../data/products";
import {
  isSupabaseConfigured,
  fetchProductsFromDB,
  upsertProductInDB,
  updateProductPriceInDB,
  updateProductImageInDB,
  fetchSiteSettingsFromDB,
  upsertSiteSettingInDB,
  submitInquiryToDB,
  fetchInquiriesFromDB,
  updateInquiryStatusInDB,
  submitOrderToDB,
  fetchOrdersFromDB,
  updateOrderStatusInDB,
} from "../lib/supabaseClient";

const StoreContext = createContext(null);

const DEFAULT_SETTINGS = {
  heroImage: {
    url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=2000&q=85",
    title: "Traditional Indian Spices Assortment",
  },
  aboutImage: {
    url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
    title: "Heritage spice craftsmanship",
  },
};

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(defaultProducts);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [inquiries, setInquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load: LocalStorage Cache & Supabase Fetch
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const configured = isSupabaseConfigured();
    setIsSupabaseActive(configured);

    // Try reading cached overrides from LocalStorage for instant UI responsiveness
    try {
      const cachedProducts = localStorage.getItem("venus_green_custom_products");
      if (cachedProducts) {
        setProducts(JSON.parse(cachedProducts));
      }
      const cachedSettings = localStorage.getItem("venus_green_custom_settings");
      if (cachedSettings) {
        setSiteSettings(JSON.parse(cachedSettings));
      }
      const cachedInquiries = localStorage.getItem("venus_green_local_inquiries");
      if (cachedInquiries) {
        setInquiries(JSON.parse(cachedInquiries));
      }
      const cachedOrders = localStorage.getItem("venus_green_local_orders");
      if (cachedOrders) {
        setOrders(JSON.parse(cachedOrders));
      }
    } catch (e) {
      console.warn("Error reading from localStorage cache:", e);
    }

    // If Supabase is configured, fetch live remote data
    if (configured) {
      try {
        const [dbProducts, dbSettings, dbInquiries, dbOrders] = await Promise.allSettled([
          fetchProductsFromDB(),
          fetchSiteSettingsFromDB(),
          fetchInquiriesFromDB(),
          fetchOrdersFromDB(),
        ]);

        if (dbProducts.status === "fulfilled" && dbProducts.value && dbProducts.value.length > 0) {
          // Map DB columns to frontend camelCase if needed
          const mapped = dbProducts.value.map((p) => ({
            ...p,
            englishName: p.english_name || p.englishName,
            tamilName: p.tamil_name || p.tamilName,
            categoryLabel: p.category_label || p.categoryLabel,
            shortDescription: p.short_description || p.shortDescription,
            fullDescription: p.full_description || p.fullDescription,
            reviewCount: p.review_count || p.reviewCount,
            isPopular: p.is_popular !== undefined ? p.is_popular : p.isPopular,
          }));
          setProducts(mapped);
          localStorage.setItem("venus_green_custom_products", JSON.stringify(mapped));
        }

        if (dbSettings.status === "fulfilled" && dbSettings.value) {
          const remoteSettings = { ...DEFAULT_SETTINGS };
          if (dbSettings.value.hero_image) {
            remoteSettings.heroImage = dbSettings.value.hero_image;
          }
          if (dbSettings.value.about_image) {
            remoteSettings.aboutImage = dbSettings.value.about_image;
          }
          setSiteSettings(remoteSettings);
          localStorage.setItem("venus_green_custom_settings", JSON.stringify(remoteSettings));
        }

        if (dbInquiries.status === "fulfilled" && dbInquiries.value) {
          setInquiries(dbInquiries.value);
        }

        if (dbOrders.status === "fulfilled" && dbOrders.value) {
          setOrders(dbOrders.value);
        }
      } catch (err) {
        console.error("Error connecting to Supabase data:", err);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Action: Update Product Price
  const updateProductPrice = async (productId, newWeights) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === productId ? { ...p, weights: newWeights } : p
      );
      try {
        localStorage.setItem("venus_green_custom_products", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseActive) {
      try {
        await updateProductPriceInDB(productId, newWeights);
      } catch (err) {
        console.error("Error updating price in Supabase:", err);
      }
    }
  };

  // 3. Action: Update Product Image
  const updateProductImage = async (productId, newImageUrl) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === productId ? { ...p, image: newImageUrl } : p
      );
      try {
        localStorage.setItem("venus_green_custom_products", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseActive) {
      try {
        await updateProductImageInDB(productId, newImageUrl);
      } catch (err) {
        console.error("Error updating image in Supabase:", err);
      }
    }
  };

  // 4. Action: Save / Upsert Full Product
  const updateProductDetails = async (updatedProduct) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === updatedProduct.id);
      let nextList;
      if (index > -1) {
        nextList = [...prev];
        nextList[index] = { ...nextList[index], ...updatedProduct };
      } else {
        nextList = [...prev, updatedProduct];
      }
      try {
        localStorage.setItem("venus_green_custom_products", JSON.stringify(nextList));
      } catch (e) {}
      return nextList;
    });

    if (isSupabaseActive) {
      try {
        await upsertProductInDB(updatedProduct);
      } catch (err) {
        console.error("Error saving product to Supabase:", err);
      }
    }
  };

  // 5. Action: Update Site Images (Hero / About)
  const updateSiteImage = async (type, imageUrl, title = "") => {
    const key = type === "hero" ? "hero_image" : "about_image";
    const stateKey = type === "hero" ? "heroImage" : "aboutImage";
    const newVal = { url: imageUrl, title: title || `${type} image` };

    setSiteSettings((prev) => {
      const updated = { ...prev, [stateKey]: newVal };
      try {
        localStorage.setItem("venus_green_custom_settings", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseActive) {
      try {
        await upsertSiteSettingInDB(key, newVal, `${type} section visual image`);
      } catch (err) {
        console.error("Error updating site image in Supabase:", err);
      }
    }
  };

  // 6. Action: Customer Inquiries (Contact Form)
  const submitInquiry = async (inquiryData) => {
    let savedRecord = null;
    if (isSupabaseActive) {
      try {
        savedRecord = await submitInquiryToDB(inquiryData);
      } catch (e) {
        console.warn("Supabase inquiry failed, saving locally:", e);
      }
    }

    const record = savedRecord || {
      id: Date.now().toString(),
      ...inquiryData,
      status: "new",
      created_at: new Date().toISOString(),
    };

    setInquiries((prev) => {
      const updated = [record, ...prev];
      try {
        localStorage.setItem("venus_green_local_inquiries", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    return record;
  };

  const updateInquiryStatus = async (id, status) => {
    setInquiries((prev) => {
      const updated = prev.map((inq) => (inq.id === id ? { ...inq, status } : inq));
      try {
        localStorage.setItem("venus_green_local_inquiries", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseActive) {
      try {
        await updateInquiryStatusInDB(id, status);
      } catch (err) {
        console.error("Error updating inquiry in Supabase:", err);
      }
    }
  };

  // 7. Action: Customer Orders
  const recordOrder = async (orderData) => {
    let savedOrder = null;
    if (isSupabaseActive) {
      try {
        savedOrder = await submitOrderToDB(orderData);
      } catch (e) {
        console.warn("Supabase order recording failed, saving locally:", e);
      }
    }

    const record = savedOrder || {
      ...orderData,
      status: "received",
      created_at: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [record, ...prev];
      try {
        localStorage.setItem("venus_green_local_orders", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    return record;
  };

  const updateOrderStatus = async (orderId, { status, paymentStatus }) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: status || ord.status,
            payment_status: paymentStatus || ord.payment_status || ord.paymentStatus,
          };
        }
        return ord;
      });
      try {
        localStorage.setItem("venus_green_local_orders", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isSupabaseActive) {
      try {
        await updateOrderStatusInDB(orderId, { status, paymentStatus });
      } catch (err) {
        console.error("Error updating order in Supabase:", err);
      }
    }
  };

  // 8. 1-Click Database Seed / Sync: Copies the 15 default products to Supabase
  const syncInitialProductsToSupabase = async () => {
    if (!isSupabaseActive) {
      throw new Error("Supabase is not yet configured. Please add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY to .env.local");
    }

    let successCount = 0;
    for (const prod of defaultProducts) {
      await upsertProductInDB(prod);
      successCount++;
    }

    await upsertSiteSettingInDB("hero_image", DEFAULT_SETTINGS.heroImage, "Hero background image");
    await upsertSiteSettingInDB("about_image", DEFAULT_SETTINGS.aboutImage, "About section image");

    await loadData();
    return successCount;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        siteSettings,
        inquiries,
        orders,
        isSupabaseActive,
        isLoading,
        updateProductPrice,
        updateProductImage,
        updateProductDetails,
        updateSiteImage,
        submitInquiry,
        updateInquiryStatus,
        recordOrder,
        updateOrderStatus,
        syncInitialProductsToSupabase,
        refreshData: loadData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
