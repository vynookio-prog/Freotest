-- ==============================================================================
-- FREONIX - Supabase Database Schema & Initial Migration
-- Project URL: https://wvsyzexwmhyckbemuced.supabase.co
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Berikan izin akses penuh ke role anon, authenticated, dan service_role
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.store_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated, service_role;

-- Pastikan realtime update dan delete membawa payload penuh
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;

-- Policy Categories
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert categories" ON public.categories;
CREATE POLICY "Allow public insert categories" ON public.categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update categories" ON public.categories;
CREATE POLICY "Allow public update categories" ON public.categories FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete categories" ON public.categories;
CREATE POLICY "Allow public delete categories" ON public.categories FOR DELETE USING (true);

-- Policy Products
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert products" ON public.products;
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update products" ON public.products;
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete products" ON public.products;
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

-- Policy Orders
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete orders" ON public.orders;
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

-- Policy Store Settings
DROP POLICY IF EXISTS "Allow public read store_settings" ON public.store_settings;
CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert store_settings" ON public.store_settings;
CREATE POLICY "Allow public insert store_settings" ON public.store_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update store_settings" ON public.store_settings;
CREATE POLICY "Allow public update store_settings" ON public.store_settings FOR UPDATE USING (true) WITH CHECK (true);

-- Policy Notifications
DROP POLICY IF EXISTS "Allow public read notifications" ON public.notifications;
CREATE POLICY "Allow public read notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert notifications" ON public.notifications;
CREATE POLICY "Allow public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update notifications" ON public.notifications;
CREATE POLICY "Allow public update notifications" ON public.notifications FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete notifications" ON public.notifications;
CREATE POLICY "Allow public delete notifications" ON public.notifications FOR DELETE USING (true);

-- Policy Audit Logs
DROP POLICY IF EXISTS "Allow public read audit_logs" ON public.audit_logs;
CREATE POLICY "Allow public read audit_logs" ON public.audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete audit_logs" ON public.audit_logs;
CREATE POLICY "Allow public delete audit_logs" ON public.audit_logs FOR DELETE USING (true);

-- ==============================================================================
-- REALTIME REPLICATION SETUP
-- ==============================================================================

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ==============================================================================
-- STORAGE BUCKET SETUP (freonix-uploads)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('freonix-uploads', 'freonix-uploads', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public select on freonix-uploads" ON storage.objects;
CREATE POLICY "Allow public select on freonix-uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'freonix-uploads');

DROP POLICY IF EXISTS "Allow public insert on freonix-uploads" ON storage.objects;
CREATE POLICY "Allow public insert on freonix-uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'freonix-uploads');

DROP POLICY IF EXISTS "Allow public update on freonix-uploads" ON storage.objects;
CREATE POLICY "Allow public update on freonix-uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'freonix-uploads') WITH CHECK (bucket_id = 'freonix-uploads');

DROP POLICY IF EXISTS "Allow public delete on freonix-uploads" ON storage.objects;
CREATE POLICY "Allow public delete on freonix-uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'freonix-uploads');

-- ==============================================================================
-- SEED INITIAL DATA (Data Menu Kuliner & Pengaturan Freonix)
-- ==============================================================================

-- Store Settings
INSERT INTO public.store_settings (
    id, store_name, event_date, event_date_display, admin_phone, currency, low_stock_threshold, store_status, order_prefix
) VALUES (
    'default', 'FREONIX XII-F1', '2026-09-23', '23 September 2026', '6287856624994', 'IDR', 5, 'open', 'FRX'
) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO public.categories (id, slug, name, description, status)
VALUES 
    ('cat-1', 'makanan-ringan', 'Makanan Ringan', 'Street food & jajanan gurih khas kepulauan Filipina', 'active'),
    ('cat-2', 'makanan-utama', 'Makanan Utama', 'Hidangan lauk lezat dengan bumbu marinasi kaya rempah', 'active'),
    ('cat-3', 'minuman-dessert', 'Minuman & Dessert', 'Pencuci mulut manis dan minuman segar tradisional', 'active')
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status;

-- Products
INSERT INTO public.products (
    id, slug, name, category_id, category_name, price, discount_price, stock, unit, status, description, image, wa_link, ingredients, tools, nutrition
) VALUES 
(
    'kwek-kwek',
    'kwek-kwek',
    'Kwek Kwek',
    'cat-1',
    'Makanan Ringan',
    2000,
    0,
    45,
    'pcs',
    'active',
    'Jajanan kaki lima khas Filipina berupa telur puyuh rebus yang dibalut adonan tepung berwarna oranye dan digoreng hingga renyah.',
    '/produk-kwek-kwek.jpg',
    'https://wa.link/kdmsu4',
    '["Telur puyuh (direbus & dikupas)", "Tepung terigu & maizena", "Pewarna makanan oranye alami (Annatto)", "Garam, kaldu bubuk, & merica", "Air mineral", "Minyak goreng"]'::jsonb,
    '["Mangkuk adonan", "Pengaduk (Whisk)", "Wajan penggorengan", "Saringan minyak", "Tusuk sate bambu"]'::jsonb,
    '[{"label": "Kalori", "value": "150 kkal"}, {"label": "Protein", "value": "6 g"}, {"label": "Lemak", "value": "10 g"}, {"label": "Karbohidrat", "value": "8 g"}]'::jsonb
),
(
    'chicken-adobo',
    'chicken-adobo',
    'Chicken Adobo',
    'cat-2',
    'Makanan Utama',
    15000,
    0,
    28,
    'porsi',
    'active',
    'Hidangan nasional Filipina berupa potongan ayam yang dimasak perlahan dalam campuran kecap asin, cuka, bawang putih, dan merica hitam hingga meresap sempurna.',
    '/produk-chicken-adobo.jpg',
    'https://wa.link/y1k3hz',
    '["Daging ayam segar (potong sedang)", "Kecap asin pekat", "Cuka putih / cuka aren", "Bawang putih (geprek kasar)", "Biji lada hitam utuh", "Daun salam kering (Bay leaves)", "Sedikit gula pasir", "Air & Minyak goreng"]'::jsonb,
    '["Pisau daging", "Talenan tebal", "Panci atau Wajan tertutup", "Spatula kayu"]'::jsonb,
    '[{"label": "Kalori", "value": "250 kkal"}, {"label": "Protein", "value": "25 g"}, {"label": "Lemak", "value": "12 g"}, {"label": "Karbohidrat", "value": "5 g"}]'::jsonb
),
(
    'halo-halo',
    'halo-halo',
    'Halo-Halo',
    'cat-3',
    'Minuman & Dessert',
    5000,
    0,
    35,
    'cup',
    'active',
    'Pencuci mulut es serut ikonik dari Filipina dengan campuran ube (ubi ungu), susu evaporasi, dan aneka isian menyegarkan.',
    '/produk-halo-halo.jpg',
    'https://wa.link/ukep08',
    '["Es batu kristal", "Susu evaporasi cair", "Ube Halaya (selai ubi ungu)", "Kacang merah manis", "Nata de coco & jelly", "Irisan pisang raja matang", "Nangka manis", "Es krim Ube (opsional)", "Gula aren cair"]'::jsonb,
    '["Mesin penyerut es / blender es", "Gelas cup plastik saji", "Sendok panjang", "Wadah penyimpanan isian"]'::jsonb,
    '[{"label": "Kalori", "value": "300 kkal"}, {"label": "Protein", "value": "8 g"}, {"label": "Lemak", "value": "6 g"}, {"label": "Karbohidrat", "value": "55 g"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    category_name = EXCLUDED.category_name,
    price = EXCLUDED.price,
    discount_price = EXCLUDED.discount_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    status = EXCLUDED.status,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    wa_link = EXCLUDED.wa_link,
    ingredients = EXCLUDED.ingredients,
    tools = EXCLUDED.tools,
    nutrition = EXCLUDED.nutrition;

