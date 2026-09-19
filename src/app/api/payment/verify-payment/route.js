import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSimulated,
    } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Simulated payment validation
    if (isSimulated || !keySecret || keySecret === "your_razorpay_secret_key") {
      return NextResponse.json({
        success: true,
        verified: true,
        isSimulated: true,
        paymentId: razorpay_payment_id || "pay_sim_" + Date.now(),
      });
    }

    // Verify real signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
      });
    } else {
      return NextResponse.json(
        { success: false, verified: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
