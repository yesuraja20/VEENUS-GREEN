-- ====================================================================
-- VENUS GREEN SPICES - SUPABASE DATABASE SCHEMA
-- Execute this SQL in your Supabase Project: SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. PRODUCTS TABLE
-- Stores dynamic products, descriptions, origin, weights and real-time pricing
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_name TEXT,
  tamil_name TEXT,
  category TEXT NOT NULL DEFAULT 'whole-spices',
  category_label TEXT DEFAULT 'Whole Spices',
  short_description TEXT,
  full_description TEXT,
  origin TEXT,
  badge TEXT,
  rating NUMERIC DEFAULT 4.8,
  review_count INTEGER DEFAULT 120,
  is_popular BOOLEAN DEFAULT false,
  image TEXT NOT NULL,
  weights JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SITE SETTINGS & CONTENT TABLE
-- Stores website images (Hero image, About section image, etc.) and store settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial site images and settings
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('hero_image', '{"url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=2000&q=85", "title": "Traditional Indian Spices Assortment"}'::jsonb, 'Hero section background image'),
  ('about_image', '{"url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80", "title": "Heritage spice craftsmanship"}'::jsonb, 'About section visual image')
ON CONFLICT (key) DO NOTHING;

-- 3. CUSTOMER INQUIRIES TABLE
-- Stores submissions from the website contact/inquiry form
CREATE TABLE IF NOT EXISTS public.customer_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'resolved'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CUSTOMER ORDERS TABLE
-- Stores all orders placed via Razorpay (Online), Cash on Delivery (COD), or WhatsApp
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL, -- 'Online (Razorpay)', 'Cash on Delivery', 'WhatsApp'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_id TEXT, -- Razorpay Payment ID if paid
  razorpay_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'received', -- 'received', 'processing', 'shipped', 'delivered', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read active products; allow insert/update for admin/anon with secret
CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow write access to products"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Site Settings: Everyone can read; allow write
CREATE POLICY "Allow public read access to site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow write access to site_settings"
  ON public.site_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Inquiries: Anyone can submit an inquiry; anyone can read with anon/service key
CREATE POLICY "Allow anyone to insert customer inquiries"
  ON public.customer_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select on customer inquiries"
  ON public.customer_inquiries FOR SELECT
  USING (true);

CREATE POLICY "Allow update on customer inquiries"
  ON public.customer_inquiries FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Orders: Anyone can submit an order; anyone can read/update orders
CREATE POLICY "Allow anyone to insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select on orders"
  ON public.orders FOR SELECT
  USING (true);

CREATE POLICY "Allow update on orders"
  ON public.orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ====================================================================
-- SUPABASE STORAGE BUCKET FOR PRODUCT & SITE IMAGES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket access policies
CREATE POLICY "Public can view website assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'website-assets');

CREATE POLICY "Public can upload website assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'website-assets');

CREATE POLICY "Public can update website assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'website-assets');
