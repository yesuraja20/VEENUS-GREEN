import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { siteConfig } from "../../../../config/siteConfig";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, customer, items } = body;

    // 1. Backend Validation of items and order amount
    let computedSubtotal = 0;
    if (Array.isArray(items) && items.length > 0) {
      computedSubtotal = items.reduce((acc, item) => {
        const unitPrice = Number(item.selectedWeight?.price || item.price || 0);
        const qty = Number(item.quantity || 1);
        return acc + unitPrice * qty;
      }, 0);
    } else if (amount && Number(amount) > 0) {
      computedSubtotal = Number(amount);
    } else {
      return NextResponse.json(
        { success: false, error: "Cart is empty or invalid order items provided." },
        { status: 400 }
      );
    }

    const freeThreshold = siteConfig?.shipping?.freeDeliveryThreshold || 499;
    const standardShipping = siteConfig?.shipping?.standardShippingFee || 40;
    const shippingFee = computedSubtotal >= freeThreshold ? 0 : standardShipping;
    const computedGrandTotal = computedSubtotal + shippingFee;

    // Amount in paise for Razorpay (1 INR = 100 paise)
    const amountInPaise = Math.round(computedGrandTotal * 100);

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount." },
        { status: 400 }
      );
    }

    // 2. Load and validate server-side Razorpay credentials
    const keyId = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    // Check if real or test keys are provided in environment
    const isConfigured =
      Boolean(keyId) &&
      Boolean(keySecret) &&
      keyId !== "rzp_test_your_key_id" &&
      keySecret !== "your_razorpay_secret_key";

    if (!isConfigured) {
      // In development/test mode without API keys added to .env.local yet:
      // Return a simulated order ID to allow preview and UI verification
      const simulatedOrderId = "order_sim_" + Date.now();
      return NextResponse.json({
        success: true,
        isSimulated: true,
        orderId: simulatedOrderId,
        amount: amountInPaise,
        currency,
        keyId: keyId || "rzp_test_mock_id",
        subtotal: computedSubtotal,
        shippingFee,
        grandTotal: computedGrandTotal,
        message:
          "Razorpay test keys not yet entered in .env.local. Running in simulation mode.",
      });
    }

    // 3. Create real Razorpay order using official SDK
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret, // Server-only: never sent to client
    });

    const receiptId = receipt || `rcpt_${Date.now()}`;
    const cleanCustomerPhone = (customer?.phone || "").replace(/\D/g, "").slice(-10);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receiptId.slice(0, 40),
      notes: {
        customer_name: (customer?.name || "Customer").slice(0, 50),
        customer_phone: cleanCustomerPhone,
        customer_city: (customer?.city || "").slice(0, 50),
      },
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      isSimulated: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // Only public key ID is returned to client
      subtotal: computedSubtotal,
      shippingFee,
      grandTotal: computedGrandTotal,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create Razorpay payment order.",
      },
      { status: 500 }
    );
  }
}
