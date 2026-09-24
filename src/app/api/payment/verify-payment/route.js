import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  saveVerifiedOrderToSupabase,
  getSupabaseServerClient,
} from "../../../../lib/supabaseServer";

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

    // 3. Cryptographic Signature Verification using server-only RAZORPAY_KEY_SECRET (Timing-safe comparison)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    let isAuthentic = false;
    try {
      const expectedBuf = Buffer.from(expectedSignature, "utf8");
      const actualBuf = Buffer.from(razorpay_signature, "utf8");
      if (expectedBuf.length === actualBuf.length) {
        isAuthentic = crypto.timingSafeEqual(expectedBuf, actualBuf);
      }
    } catch {
      isAuthentic = false;
    }

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

    // 4. Duplicate Payment Prevention: Check if paymentId already processed
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data: existingPayment } = await client
          .from("orders")
          .select("*")
          .eq("payment_id", razorpay_payment_id)
          .maybeSingle();

        if (existingPayment) {
          return NextResponse.json({
            success: true,
            verified: true,
            isDuplicate: true,
            paymentId: razorpay_payment_id,
            order: { ...existingPayment, savedToDb: true },
            message: "Payment already verified and recorded.",
          });
        }
      } catch (dupCheckErr) {
        console.warn("Duplicate check non-blocking warning:", dupCheckErr.message);
      }
    }

    // 5. On successful verification: Save order to Supabase
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
