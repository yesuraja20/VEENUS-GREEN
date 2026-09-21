import { NextResponse } from "next/server";
import crypto from "crypto";
import { saveVerifiedOrderToSupabase } from "../../../../lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
      isSimulated,
    } = body;

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    // 1. Handle Simulated Mode (when keys are not yet entered in .env.local)
    if (isSimulated || !keySecret || keySecret === "your_razorpay_secret_key") {
      const simulatedPaymentId = razorpay_payment_id || "pay_sim_" + Date.now();
      const confirmedOrderPayload = {
        ...(orderData || {}),
        paymentMethod: "Online (Razorpay)",
        paymentStatus: "paid",
        paymentId: simulatedPaymentId,
        razorpayOrderId: razorpay_order_id || "order_sim_" + Date.now(),
        status: "received",
      };

      // Save order to Supabase
      const savedRecord = await saveVerifiedOrderToSupabase(confirmedOrderPayload);

      return NextResponse.json({
        success: true,
        verified: true,
        isSimulated: true,
        paymentId: simulatedPaymentId,
        order: savedRecord,
        message: "Simulated payment verified and order recorded.",
      });
    }

    // 2. Validate parameters for real signature check
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Missing required Razorpay payment confirmation details.",
        },
        { status: 400 }
      );
    }

    // 3. Cryptographic Signature Verification using server-only RAZORPAY_KEY_SECRET
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.warn(
        `Invalid payment signature for order: ${razorpay_order_id}, payment: ${razorpay_payment_id}`
      );
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Payment verification failed. Signature mismatch.",
        },
        { status: 400 }
      );
    }

    // 4. On successful verification: Save order to Supabase
    const confirmedOrderPayload = {
      ...(orderData || {}),
      paymentMethod: "Online (Razorpay)",
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      status: "received",
    };

    const savedRecord = await saveVerifiedOrderToSupabase(confirmedOrderPayload);

    return NextResponse.json({
      success: true,
      verified: true,
      isSimulated: false,
      paymentId: razorpay_payment_id,
      order: savedRecord,
    });
  } catch (error) {
    console.error("Payment verification server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during payment verification.",
      },
      { status: 500 }
    );
  }
}
