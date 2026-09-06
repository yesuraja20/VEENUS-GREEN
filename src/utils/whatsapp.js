import { siteConfig } from "../config/siteConfig";

/**
 * Formats a clean, professional, emojis-enhanced WhatsApp order message
 * and generates the universal WhatsApp click-to-chat URL.
 */
export function generateWhatsAppOrderUrl({
  customer,
  items,
  subtotal,
  shippingFee,
  grandTotal,
}) {
  const number = siteConfig.whatsappNumber;

  const itemLines = items
    .map((item, index) => {
      const unitPrice = item.selectedWeight?.price || item.price;
      const weightLabel = item.selectedWeight?.label || "";
      const itemTotal = unitPrice * item.quantity;
      return `${index + 1}. *${item.name}* (${item.tamilName})
   📦 Pack: ${weightLabel} | Qty: ${item.quantity}
   💵 Price: ₹${unitPrice} x ${item.quantity} = ₹${itemTotal}`;
    })
    .join("\n\n");

  const addressDetails = customer.address
    ? `\n📍 *Delivery Address:*\n${customer.address}, ${customer.city} - ${customer.pincode}`
    : "";

  const notesText = customer.notes ? `\n📝 *Notes:* ${customer.notes}` : "";

  const message = `🌿 *NEW ORDER - ${siteConfig.name.toUpperCase()}* 🌿
_Pure Spices. Authentic Taste._
═══════════════════════════
👤 *CUSTOMER DETAILS:*
• *Name:* ${customer.name || "Customer"}
• *Mobile:* ${customer.phone || "Not provided"}${addressDetails}${notesText}

═══════════════════════════
🛒 *ORDERED SPICES:*

${itemLines}

═══════════════════════════
💰 *BILLING SUMMARY:*
• *Subtotal:* ₹${subtotal}
• *Shipping:* ${shippingFee === 0 ? "FREE (Orders over ₹" + siteConfig.shipping.freeDeliveryThreshold + ")" : "₹" + shippingFee}
• *GRAND TOTAL:* *₹${grandTotal}*
═══════════════════════════

🙏 _Please confirm my order and share the payment/delivery dispatch details._`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

/**
 * Generates a general WhatsApp inquiry link
 */
export function generateWhatsAppInquiryUrl(customMessage) {
  const number = siteConfig.whatsappNumber;
  const text =
    customMessage ||
    `Hello ${siteConfig.name}! 🌿 I am interested in your premium Indian spices and cooking essentials. Could you please share more details?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
