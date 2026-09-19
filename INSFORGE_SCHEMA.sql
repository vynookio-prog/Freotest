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

-- 7. ULASAN & RATING (reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT NULL,
    photo_url TEXT DEFAULT NULL,
    photo_key TEXT DEFAULT NULL,
    buyer_name TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_order_product_review UNIQUE (order_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);

-- Permissions
GRANT ALL ON TABLE public.categories TO anon, authenticated;
GRANT ALL ON TABLE public.products TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO anon, authenticated;
GRANT ALL ON TABLE public.store_settings TO anon, authenticated;
GRANT ALL ON TABLE public.notifications TO anon, authenticated;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated;
GRANT ALL ON TABLE public.reviews TO anon, authenticated;

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

INSERT INTO public.products (
    id, slug, name, category_id, category_name, price, discount_price, stock, unit, status, description, image, wa_link, ingredients, tools, nutrition
) VALUES 
(
    'mangkok-ng-kanin',
    'mangkok-ng-kanin',
    'Mangkok ng Kanin',
    'cat-2',
    'Makanan Utama',
    12000,
    0,
    50,
    'bowl',
    'active',
    'Hidangan nasi hangat dalam mangkuk dengan topping ayam crispy berbalut saus pedas gurih warna merah menyala, dilengkapi selada atau mentimun',
    'https://cdn.phototourl.com/free/2026-09-19-64f6be2d-fc17-4cf8-a859-b6ffb9812bb2.jpg',
    'https://wa.me/628818578363',
    '["Potongan daging ayam krispi renyah (crispy chicken) berbalut tepung bumbu gurih", "Nasi putih pulen hangat berkualitas", "Saus pedas gurih warna merah menyala spesial", "Garnish sayuran segar (irisan selada renyah atau mentimun segar)", "Taburan wijen aromatik & daun bawang segar"]'::jsonb,
    '["Wajan penggoreng / deep fryer stainless food-grade higienis", "Rice cooker penanak nasi pulen steril", "Wadah pencampur saus higienis", "Capitan makanan stainless & sendok takar bumbu", "Kraft paper bowl eco-friendly food-grade tahan panas + sendok higienis"]'::jsonb,
    '[{"label": "Kalori", "value": "485 kkal"}, {"label": "Protein", "value": "28 g"}, {"label": "Karbohidrat", "value": "62 g"}, {"label": "Lemak", "value": "14 g"}]'::jsonb
),
(
    'kwek-kwek',
    'kwek-kwek',
    'Kwek Kwek',
    'cat-1',
    'Makanan Ringan',
    3000,
    0,
    50,
    'tusuk',
    'active',
    'Telur puyuh goreng berbalut tepung dengan rempah spesial, renyah di luar lembut di dalam.',
    'https://cdn.phototourl.com/free/2026-09-19-19685751-6c57-445a-b4e2-d6717f46bb30.jpg',
    'https://wa.me/628818578363',
    '["Telur puyuh rebus berkualitas (3 butir/tusuk)", "Tepung terigu & tepung maizena renyah", "Bawang putih bubuk, merica, kaldu & garam", "Pewarna makanan oranye alami", "Saus asam manis khas Filipina (saus tomat, cabai rawit, cuka & gula)", "Minyak nabati untuk menggoreng"]'::jsonb,
    '["Mangkuk adonan", "Pengaduk (Whisk)", "Wajan penggorengan", "Saringan minyak", "Tusuk sate bambu"]'::jsonb,
    '[{"label": "Kalori", "value": "146 kkal"}, {"label": "Protein", "value": "5.5 g"}, {"label": "Lemak", "value": "6.7 g"}, {"label": "Karbohidrat", "value": "15 g"}]'::jsonb
),
(
    'turon',
    'turon',
    'Turon',
    'cat-1',
    'Makanan Ringan',
    3000,
    0,
    50,
    'piece',
    'active',
    'Pisang goreng karamel khas Filipina dengan balutan kulit renyah manis legit disajikan hangat.',
    'https://ie8b79we.ap-southeast.insforge.app/api/storage/buckets/freonix-uploads/objects/products/turon.jpg',
    'https://wa.me/628818578363',
    '["Pisang uli / kepok matang manis pilihan", "Kulit lumpia tipis & renyah", "Gula palem / brown sugar karamel", "Gula pasir murni pelapis karamel krispi", "Saus karamel gurih legit (gula palem, santan kental & daun pandan)", "Minyak nabati untuk menggoreng"]'::jsonb,
    '["Wajan penggorengan / deep fryer", "Penjepit makanan tahan panas", "Saringan & rak peniris minyak food grade", "Talenan & pisau higienis", "Kemasan kertas food grade"]'::jsonb,
    '[{"label": "Kalori", "value": "156 kkal"}, {"label": "Karbohidrat", "value": "29 g"}, {"label": "Lemak", "value": "4.5 g"}, {"label": "Protein", "value": "1.3 g"}]'::jsonb
),
(
    'buko-coklat',
    'iskrambol',
    'Iskrambol',
    'cat-3',
    'Minuman & Dessert',
    7000,
    0,
    50,
    'cup',
    'active',
    'Es serut khas Filipina dengan campuran susu manis, sirup, dan aneka topping lezat menyegarkan.',
    'https://cdn.phototourl.com/free/2026-09-19-80be0309-e32c-48d6-a2d2-10032edd17e0.jpg',
    'https://wa.me/628818578363',
    '["Es serut halus higienis (Shaved ice - 2 cups)", "Susu stroberi manis, creamy & segar (1/2 cup)", "Saus cokelat kental manis (Chocolate syrup)", "Topping marshmallow lembut / marshmallow fluff", "Topping 1 scoop es krim Neapolitan lezat", "Taburan susu bubuk premium khas Iskrambol"]'::jsonb,
    '["Mesin serut es higienis", "Wadah pencampur & mixer stainless food grade", "Botol saus squeeze & sendok takar", "Cup dessert anti-tumpah 300ml + sendok"]'::jsonb,
    '[{"label": "Kalori", "value": "333 kkal"}, {"label": "Karbohidrat", "value": "61 g"}, {"label": "Lemak", "value": "7.7 g"}, {"label": "Protein", "value": "5.7 g"}]'::jsonb
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
