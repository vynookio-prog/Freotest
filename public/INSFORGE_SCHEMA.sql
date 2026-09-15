-- ==============================================================================
-- FREONIX - InsForge PostgreSQL Database Schema & Initial Migration
-- Project URL: https://ie8b79we.ap-southeast.insforge.app
-- ==============================================================================

-- 1. KATEGORI (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PRODUK (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT DEFAULT '',
    price NUMERIC NOT NULL DEFAULT 0,
    discount_price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'porsi',
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    wa_link TEXT DEFAULT '',
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    nutrition JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PESANAN (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- Nomor pesanan (misal FRX-...)
    name TEXT NOT NULL,
    kelas TEXT NOT NULL,
    phone TEXT DEFAULT '',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_harga NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'qris',
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    order_status TEXT NOT NULL DEFAULT 'Pending',
    payment_proof TEXT DEFAULT '',
    payment_proof_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    order_time TEXT DEFAULT '',
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    verified_at TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PENGATURAN TOKO (store_settings)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT DEFAULT 'FREONIX XII-F1',
    event_date TEXT DEFAULT '2026-09-23',
    event_date_display TEXT DEFAULT '23 September 2026',
    admin_phone TEXT DEFAULT '6287856624994',
    currency TEXT DEFAULT 'IDR',
    low_stock_threshold INTEGER DEFAULT 5,
    store_status TEXT DEFAULT 'open',
    order_prefix TEXT DEFAULT 'FRX',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. NOTIFIKASI ADMIN (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT DEFAULT '',
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    time TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. AUDIT LOGS (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    actor TEXT DEFAULT 'Admin',
    time TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Permissions
GRANT ALL ON TABLE public.categories TO anon, authenticated;
GRANT ALL ON TABLE public.products TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO anon, authenticated;
GRANT ALL ON TABLE public.store_settings TO anon, authenticated;
GRANT ALL ON TABLE public.notifications TO anon, authenticated;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated;

-- Default Settings & Seed Data
INSERT INTO public.store_settings (id, store_name, event_date, event_date_display, admin_phone, currency, low_stock_threshold, store_status, order_prefix)
VALUES ('default', 'FREONIX XII-F1', '2026-09-23', '23 September 2026', '6287856624994', 'IDR', 5, 'open', 'FRX')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, slug, name, description, status)
VALUES 
('cat-1', 'makanan-ringan', 'Makanan Ringan', 'Street food & jajanan gurih khas kepulauan Filipina', 'active'),
('cat-2', 'makanan-utama', 'Makanan Utama', 'Hidangan lauk lezat dengan bumbu marinasi kaya rempah', 'active'),
('cat-3', 'minuman-dessert', 'Minuman & Dessert', 'Pencuci mulut manis dan minuman segar tradisional', 'active')
ON CONFLICT (id) DO NOTHING;
