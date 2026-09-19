import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { amount, currency = "INR", receipt, customer } = await req.json();

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if Razorpay credentials are provided
    if (!keyId || !keySecret || keyId === "rzp_test_your_key_id") {
      // In demo mode (keys not yet added to .env.local), create simulated order ID
      const simulatedOrderId = "order_sim_" + Date.now();
      return NextResponse.json({
        success: true,
        isSimulated: true,
        orderId: simulatedOrderId,
        amount: amount * 100, // in paise
        currency,
        message: "Razorpay keys not configured. Simulating order for development.",
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        customer_name: customer?.name || "",
        customer_phone: customer?.phone || "",
      },
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
