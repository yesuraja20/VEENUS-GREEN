# Venus Green – Premium Spices & Cooking Essentials

A modern, luxury, production-ready ecommerce website for authentic Indian spices and cooking essentials, built with **React**, **Next.js 14 (App Router)**, **JavaScript**, and **Tailwind CSS**.

Fully optimized and ready for one-click **Vercel** deployment with zero external backend dependencies.

---

## 🌿 Key Features

- **15 Authentic Indian Spices & Essentials**: Complete with English and Tamil names (மிளகு, சீரகம், கடுகு, வெந்தயம், சோம்பு, மல்லி, ஏலக்காய், பட்டை, கிராம்பு, பெருங்காயம், மஞ்சள் தூள், இஞ்சி, பூண்டு, ஜாதிக்காய், ஜாதிப்பத்திரி).
- **Bilingual Live Search**: Instant search by English names, Tamil script, Tamil transliterated names (e.g. *Milagu*, *Seeragam*, *Kadugu*), and culinary descriptions.
- **Dynamic Weight Selector**: Switch between 50g, 100g, 250g, 500g, and 1kg with real-time price updates and quantity controls.
- **Modern Slide-Out Cart Drawer**:
  - Add / remove items, adjust quantities.
  - Free delivery threshold tracker (Free shipping on orders above ₹499).
  - Synchronized and persisted in `localStorage` across page reloads.
- **Seamless WhatsApp Ordering**:
  - Automatically formats a clean, itemized invoice with Customer Name, Phone, Delivery Address, ordered items with pack weights, subtotal, and total amount.
  - Launches WhatsApp with the pre-filled message in one tap.
- **Centralized Configuration**: WhatsApp number, phone, email, and store address are maintained in a single configuration file (`src/config/siteConfig.js`).
- **Validated Checkout Modal**: Complete with field validation for 10-digit mobile numbers, 6-digit Indian PIN codes, street address, and Cash on Delivery order confirmation receipt.
- **Quick-View Spice Preview**: Deep dive into the aroma profile, harvest estate, and culinary pairings.
- **Luxury UI/UX Aesthetics**: Deep Forest Green (`#0d281e`), Metallic Gold (`#d4af37`), and Warm Sand Cream with smooth micro-animations.
- **100% Mobile Responsive**: Customized hamburger menu, touch-friendly drawers, and adaptive cards.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: React 18
- **Styling**: Tailwind CSS with custom luxury color palette
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API (`CartContext`) + `localStorage`

---

## 📂 Project Structure

```
VENUS GREEN/
├── public/
│   ├── icon.svg               # SVG brand icon
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css        # Tailwind styles, Google fonts, luxury utilities
│   │   ├── layout.js          # SEO metadata, CartProvider wrapper, modal containers
│   │   ├── page.js            # Main landing page combining all sections
│   │   └── icon.svg           # Tab icon
│   ├── components/
│   │   ├── Navbar.jsx         # Sticky navbar with search, cart badge, mobile drawer
│   │   ├── Hero.jsx           # Cinematic hero with pure spices tagline & CTAs
│   │   ├── CategoryCards.jsx  # Whole Spices, Powdered Spices, Cooking Essentials
│   │   ├── ProductCatalog.jsx # 15 products with bilingual search & sorting
│   │   ├── ProductCard.jsx    # Weight selector, quantity stepper, cart action
│   │   ├── CartDrawer.jsx     # Modern slide-out drawer with free shipping tracker
│   │   ├── CheckoutModal.jsx  # Form validation, COD receipt & WhatsApp order
│   │   ├── QuickViewModal.jsx # Detail preview modal with origin and culinary notes
│   │   ├── AboutSection.jsx   # "Tradition in Every Spice" story
│   │   ├── WhyChooseUs.jsx    # 6 feature cards with gold accents
│   │   ├── Testimonials.jsx   # 4 verified customer review cards
│   │   ├── ContactSection.jsx # Contact details and working inquiry form UI
│   │   ├── Footer.jsx         # Brand story, quick links, category links, © 2026
│   │   ├── Toast.jsx          # Notification toast for cart actions
│   │   └── WhatsAppFloating.jsx # Persistent floating WhatsApp quick button
│   ├── config/
│   │   └── siteConfig.js      # Centralized business, phone & WhatsApp config
│   ├── context/
│   │   └── CartContext.jsx    # Cart state, weight pricing & LocalStorage persistence
│   ├── data/
│   │   ├── categories.js      # 3 main spice categories data
│   │   └── products.js        # 15 detailed spices with English & Tamil metadata
│   └── utils/
│       └── whatsapp.js        # Formatter for structured WhatsApp order messages
├── next.config.mjs            # Next.js configuration with remote image patterns
├── tailwind.config.js         # Custom forest, gold, and cream design tokens
├── postcss.config.js
├── package.json
└── README.md
```

---

## 🚀 How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## ⚡ How to Deploy on Vercel

1. Push this repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **"Import Project"** and select your GitHub repository.
4. Framework Preset: **Next.js** (detected automatically).
5. Build Command: `npm run build` (default).
6. Click **Deploy**. Your luxury spice store is live!

---

## ⚙️ Updating WhatsApp Number & Store Details

To change the phone number or WhatsApp order recipient, edit **`src/config/siteConfig.js`**:

```javascript
export const siteConfig = {
  name: "Venus Green",
  whatsappNumber: "919876543210", // Country code + 10-digit number (no + sign)
  whatsappDisplayNumber: "+91 98765 43210",
  phone: "+91 98765 43210",
  email: "care@venusgreen.com",
  // ...
};
```
All order generators, floating buttons, and footer links update automatically across the entire site.

---

## 📜 License
© 2026 Venus Green Spices & Cooking Essentials. All Rights Reserved.
