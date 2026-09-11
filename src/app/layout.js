import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { LanguageProvider } from "../context/LanguageContext";
import Toast from "../components/Toast";
import CartDrawer from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";
import QuickViewModal from "../components/QuickViewModal";
import WhatsAppFloating from "../components/WhatsAppFloating";
import { siteConfig } from "../config/siteConfig";

export const metadata = {
  title: `${siteConfig.name} | Pure Spices & Cooking Essentials`,
  description:
    "Buy premium pure Indian spices, Tellicherry black pepper, Salem turmeric, green cardamom, cumin & cooking essentials. 100% natural, estate-sourced and delivered fresh across India.",
  keywords: [
    "Indian Spices",
    "Venus Green",
    "Tamil Spices",
    "Milagu",
    "Seeragam",
    "Kadugu",
    "Tellicherry Pepper",
    "Salem Turmeric",
    "Green Cardamom",
    "Whole Spices Online",
    "Pure Cooking Essentials",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    title: `${siteConfig.name} - Pure Spices. Authentic Taste.`,
    description: siteConfig.subheading,
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-cream-50 text-forest-950 antialiased selection:bg-gold-500 selection:text-forest-950">
        <LanguageProvider>
          <CartProvider>
            {children}
            {/* Global Drawers & Modals */}
            <CartDrawer />
            <CheckoutModal />
            <QuickViewModal />
            <WhatsAppFloating />
            <Toast />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
