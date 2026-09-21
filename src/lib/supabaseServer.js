import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Prefer SUPABASE_SERVICE_ROLE_KEY on backend if provided; fallback to NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

let serverClient = null;

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("http") || supabaseUrl.includes("your-project-id")) {
    return null;
  }
  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverClient;
}

/**
 * Persists a verified customer order into Supabase 'orders' table
 */
export async function saveVerifiedOrderToSupabase(orderData) {
  const client = getSupabaseServerClient();
  if (!client) {
    console.warn("Supabase not configured on server. Order recorded in memory/fallback.");
    return { ...orderData, savedToDb: false };
  }

  const payload = {
    id: orderData.id,
    customer_name: orderData.customerName || orderData.name || "Customer",
    phone: orderData.phone || "",
    address: orderData.address || "",
    city: orderData.city || "",
    pincode: orderData.pincode || "",
    notes: orderData.notes || "",
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal || 0),
    shipping_fee: Number(orderData.shippingFee || 0),
    grand_total: Number(orderData.grandTotal || 0),
    payment_method: orderData.paymentMethod || "Online (Razorpay)",
    payment_status: orderData.paymentStatus || "paid",
    payment_id: orderData.paymentId || null,
    razorpay_order_id: orderData.razorpayOrderId || null,
    status: orderData.status || "received",
    created_at: orderData.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await client
      .from("orders")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (error) {
      console.error("Supabase server order insert error:", error);
      throw error;
    }

    return { ...payload, savedToDb: true, data: data ? data[0] : null };
  } catch (err) {
    console.error("Failed to save order to Supabase:", err.message);
    return { ...payload, savedToDb: false, error: err.message };
  }
}
