import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith("http") &&
      !supabaseUrl.includes("your-project-id")
  );
};

// Singleton instance
let supabaseInstance = null;

export const getSupabase = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    });
  }
  return supabaseInstance;
};

// =================================================================
// 1. PRODUCTS OPERATIONS
// =================================================================

export async function fetchProductsFromDB() {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase fetchProductsFromDB warning:", err.message);
    return null;
  }
}

export async function upsertProductInDB(product) {
  const client = getSupabase();
  if (!client) return null;

  const payload = {
    id: product.id,
    name: product.name,
    english_name: product.englishName || product.english_name || "",
    tamil_name: product.tamilName || product.tamil_name || "",
    category: product.category,
    category_label: product.categoryLabel || product.category_label || "Whole Spices",
    short_description: product.shortDescription || product.short_description || "",
    full_description: product.fullDescription || product.full_description || "",
    origin: product.origin || "",
    badge: product.badge || "",
    rating: product.rating || 4.8,
    review_count: product.reviewCount || product.review_count || 120,
    is_popular: Boolean(product.isPopular ?? product.is_popular),
    image: product.image,
    weights: product.weights,
    is_active: product.isActive ?? product.is_active ?? true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("products")
    .upsert(payload, { onConflict: "id" })
    .select();

  if (error) throw error;
  return data;
}

export async function updateProductPriceInDB(id, weights) {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from("products")
    .update({ weights, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

export async function updateProductImageInDB(id, imageUrl) {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from("products")
    .update({ image: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

// =================================================================
// 2. SITE SETTINGS & IMAGES (Hero, About, Banners)
// =================================================================

export async function fetchSiteSettingsFromDB() {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client.from("site_settings").select("*");
    if (error) throw error;

    const settingsMap = {};
    (data || []).forEach((row) => {
      settingsMap[row.key] = row.value;
    });
    return settingsMap;
  } catch (err) {
    console.warn("Supabase fetchSiteSettingsFromDB warning:", err.message);
    return null;
  }
}

export async function upsertSiteSettingInDB(key, value, description = "") {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from("site_settings")
    .upsert(
      {
        key,
        value,
        description,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    )
    .select();

  if (error) throw error;
  return data;
}

// =================================================================
// 3. CUSTOMER INQUIRIES (Contact Form Submissions)
// =================================================================

export async function submitInquiryToDB({ name, mobile, message }) {
  const client = getSupabase();
  if (!client) {
    // If Supabase not connected, return mock success
    return { id: "local-" + Date.now(), name, mobile, message, status: "new" };
  }

  const { data, error } = await client
    .from("customer_inquiries")
    .insert([
      {
        name,
        mobile,
        message,
        status: "new",
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data ? data[0] : null;
}

export async function fetchInquiriesFromDB() {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("customer_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Error fetching inquiries:", err.message);
    return [];
  }
}

export async function updateInquiryStatusInDB(id, status, adminNotes = null) {
  const client = getSupabase();
  if (!client) return null;

  const updatePayload = { status };
  if (adminNotes !== null) updatePayload.admin_notes = adminNotes;

  const { data, error } = await client
    .from("customer_inquiries")
    .update(updatePayload)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

// =================================================================
// 4. CUSTOMER ORDERS (Checkout & Payment Submissions)
// =================================================================

export async function submitOrderToDB(order) {
  const client = getSupabase();
  if (!client) {
    return order;
  }

  const payload = {
    id: order.id,
    customer_name: order.customerName || order.name,
    phone: order.phone,
    address: order.address,
    city: order.city,
    pincode: order.pincode,
    notes: order.notes || "",
    items: order.items || [],
    subtotal: order.subtotal,
    shipping_fee: order.shippingFee || 0,
    grand_total: order.grandTotal,
    payment_method: order.paymentMethod || order.payment_method || "Online (Razorpay)",
    payment_status: order.paymentStatus || order.payment_status || "paid",
    payment_id: order.paymentId || order.payment_id || null,
    razorpay_order_id: order.razorpayOrderId || order.razorpay_order_id || null,
    status: order.status || "received",
    created_at: order.createdAt || order.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("orders")
    .upsert(payload, { onConflict: "id" })
    .select();

  if (error) throw error;
  return data ? data[0] : null;
}

export async function fetchOrdersFromDB() {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Error fetching orders:", err.message);
    return [];
  }
}

export async function updateOrderStatusInDB(id, { status, paymentStatus }) {
  const client = getSupabase();
  if (!client) return null;

  const payload = { updated_at: new Date().toISOString() };
  if (status) payload.status = status;
  if (paymentStatus) payload.payment_status = paymentStatus;

  const { data, error } = await client
    .from("orders")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

// =================================================================
// 5. SUPABASE STORAGE (IMAGE UPLOADS)
// =================================================================

export async function uploadImageToSupabase(file, folder = "products") {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured.");

  const fileExt = file.name ? file.name.split(".").pop() : "jpg";
  const cleanName = (file.name || "image")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .toLowerCase();
  const fileName = `${folder}/${Date.now()}-${cleanName}.${fileExt}`;

  const { error: uploadError } = await client.storage
    .from("website-assets")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = client.storage.from("website-assets").getPublicUrl(fileName);
  return data.publicUrl;
}
