// src/utils/db.js
// FREONIX Unified Database with Supabase as Primary Backend

import { supabase, isSupabaseConfigured } from './supabase.js';

const DB_KEY = 'freonix_database_v3';

// Data default awal sebagai fallback dan template seeding
export const INITIAL_DB = {
  settings: {
    storeName: 'FREONIX XII-F1',
    eventDate: '2026-09-23',
    eventDateDisplay: '23 September 2026',
    adminPhone: '6287856624994',
    currency: 'IDR',
    lowStockThreshold: 5,
    storeStatus: 'open',
    orderPrefix: 'FRX',
    updatedAt: new Date().toISOString()
  },
  categories: [
    {
      id: 'cat-1',
      name: 'Makanan Ringan',
      slug: 'makanan-ringan',
      description: 'Street food & jajanan gurih khas kepulauan Filipina',
      status: 'active',
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 'cat-2',
      name: 'Makanan Utama',
      slug: 'makanan-utama',
      description: 'Hidangan lauk lezat dengan bumbu marinasi kaya rempah',
      status: 'active',
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 'cat-3',
      name: 'Minuman & Dessert',
      slug: 'minuman-dessert',
      description: 'Pencuci mulut manis dan minuman segar tradisional',
      status: 'active',
      createdAt: '2026-09-01T10:00:00.000Z'
    }
  ],
  products: [
    {
      id: 'kwek-kwek',
      slug: 'kwek-kwek',
      name: 'Kwek Kwek',
      categoryId: 'cat-1',
      categoryName: 'Makanan Ringan',
      price: 2000,
      discountPrice: 0,
      stock: 45,
      unit: 'pcs',
      status: 'active',
      desc: 'Jajanan kaki lima khas Filipina berupa telur puyuh rebus yang dibalut adonan tepung berwarna oranye dan digoreng hingga renyah.',
      image: '/produk-kwek-kwek.jpg',
      waLink: 'https://wa.link/kdmsu4',
      ingredients: [
        'Telur puyuh (direbus & dikupas)',
        'Tepung terigu & maizena',
        'Pewarna makanan oranye alami (Annatto)',
        'Garam, kaldu bubuk, & merica',
        'Air mineral',
        'Minyak goreng'
      ],
      tools: [
        'Mangkuk adonan',
        'Pengaduk (Whisk)',
        'Wajan penggorengan',
        'Saringan minyak',
        'Tusuk sate bambu'
      ],
      nutrition: [
        { label: 'Kalori', value: '150 kkal' },
        { label: 'Protein', value: '6 g' },
        { label: 'Lemak', value: '10 g' },
        { label: 'Karbohidrat', value: '8 g' }
      ],
      updatedAt: '2026-09-06T12:00:00.000Z'
    },
    {
      id: 'chicken-adobo',
      slug: 'chicken-adobo',
      name: 'Chicken Adobo',
      categoryId: 'cat-2',
      categoryName: 'Makanan Utama',
      price: 15000,
      discountPrice: 0,
      stock: 28,
      unit: 'porsi',
      status: 'active',
      desc: 'Hidangan nasional Filipina berupa potongan ayam yang dimasak perlahan dalam campuran kecap asin, cuka, bawang putih, dan merica hitam hingga meresap sempurna.',
      image: '/produk-chicken-adobo.jpg',
      waLink: 'https://wa.link/y1k3hz',
      ingredients: [
        'Daging ayam segar (potong sedang)',
        'Kecap asin pekat',
        'Cuka putih / cuka aren',
        'Bawang putih (geprek kasar)',
        'Biji lada hitam utuh',
        'Daun salam kering (Bay leaves)',
        'Sedikit gula pasir',
        'Air & Minyak goreng'
      ],
      tools: [
        'Pisau daging',
        'Talenan tebal',
        'Panci atau Wajan tertutup',
        'Spatula kayu'
      ],
      nutrition: [
        { label: 'Kalori', value: '250 kkal' },
        { label: 'Protein', value: '25 g' },
        { label: 'Lemak', value: '12 g' },
        { label: 'Karbohidrat', value: '5 g' }
      ],
      updatedAt: '2026-09-06T12:00:00.000Z'
    },
    {
      id: 'halo-halo',
      slug: 'halo-halo',
      name: 'Halo-Halo',
      categoryId: 'cat-3',
      categoryName: 'Minuman & Dessert',
      price: 5000,
      discountPrice: 0,
      stock: 35,
      unit: 'cup',
      status: 'active',
      desc: 'Pencuci mulut es serut ikonik dari Filipina dengan campuran ube (ubi ungu), susu evaporasi, dan aneka isian menyegarkan.',
      image: '/produk-halo-halo.jpg',
      waLink: 'https://wa.link/ukep08',
      ingredients: [
        'Es batu kristal',
        'Susu evaporasi cair',
        'Ube Halaya (selai ubi ungu)',
        'Kacang merah manis',
        'Nata de coco & jelly',
        'Irisan pisang raja matang',
        'Nangka manis',
        'Es krim Ube (opsional)',
        'Gula aren cair'
      ],
      tools: [
        'Mesin penyerut es / blender es',
        'Gelas cup plastik saji',
        'Sendok panjang',
        'Wadah penyimpanan isian'
      ],
      nutrition: [
        { label: 'Kalori', value: '300 kkal' },
        { label: 'Protein', value: '8 g' },
        { label: 'Lemak', value: '6 g' },
        { label: 'Karbohidrat', value: '55 g' }
      ],
      updatedAt: '2026-09-06T12:00:00.000Z'
    }
  ],
  orders: [],
  notifications: [],
  auditLogs: []
};

// --- DATA MAPPERS (Supabase snake_case <-> Application camelCase) ---

function mapCategoryFromDb(row) {
  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.name,
    description: row.description || '',
    status: row.status || 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapCategoryToDb(cat) {
  return {
    id: cat.id,
    slug: cat.slug || cat.id,
    name: cat.name,
    description: cat.description || '',
    status: cat.status || 'active',
    updated_at: new Date().toISOString()
  };
}

function mapProductFromDb(row) {
  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    price: Number(row.price) || 0,
    discountPrice: Number(row.discount_price) || 0,
    stock: Number(row.stock) || 0,
    unit: row.unit || 'porsi',
    status: row.status || 'active',
    desc: row.description || '',
    description: row.description || '',
    image: row.image || '',
    waLink: row.wa_link || '',
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    tools: Array.isArray(row.tools) ? row.tools : [],
    nutrition: Array.isArray(row.nutrition) ? row.nutrition : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapProductToDb(prod) {
  return {
    id: prod.id,
    slug: prod.slug || prod.id,
    name: prod.name,
    category_id: prod.categoryId || null,
    category_name: prod.categoryName || '',
    price: Number(prod.price) || 0,
    discount_price: Number(prod.discountPrice) || 0,
    stock: Math.max(0, Number(prod.stock) || 0),
    unit: prod.unit || 'porsi',
    status: prod.status || 'active',
    description: prod.desc || prod.description || '',
    image: prod.image || '',
    wa_link: prod.waLink || '',
    ingredients: Array.isArray(prod.ingredients) ? prod.ingredients : [],
    tools: Array.isArray(prod.tools) ? prod.tools : [],
    nutrition: Array.isArray(prod.nutrition) ? prod.nutrition : [],
    updated_at: new Date().toISOString()
  };
}

export function mapOrderFromDb(row) {
  const id = row.id;
  return {
    id: id,
    orderId: id,
    name: row.name,
    kelas: row.kelas,
    phone: row.phone || '',
    items: Array.isArray(row.items) ? row.items : [],
    totalHarga: Number(row.total_harga) || 0,
    paymentMethod: row.payment_method || 'qris',
    paymentStatus: row.payment_status || 'PENDING',
    orderStatus: row.order_status || 'Pending',
    paymentProof: row.payment_proof || '',
    paymentProofUrl: row.payment_proof_url || '',
    notes: row.notes || '',
    orderTime: row.order_time || '',
    history: Array.isArray(row.history) ? row.history : [],
    verifiedAt: row.verified_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapOrderToDb(o) {
  const id = o.orderId || o.id;
  return {
    id: id,
    name: o.name || '',
    kelas: o.kelas || '',
    phone: o.phone || '',
    items: Array.isArray(o.items) ? o.items : [],
    total_harga: Number(o.totalHarga != null ? o.totalHarga : o.total_harga) || 0,
    payment_method: o.paymentMethod || o.payment_method || 'qris',
    payment_status: o.paymentStatus || o.payment_status || 'PENDING',
    order_status: o.orderStatus || o.order_status || 'Pending',
    payment_proof: o.paymentProof || o.paymentProofImage || o.payment_proof || '',
    payment_proof_url: o.paymentProofUrl || o.payment_proof_url || '',
    notes: o.notes || '',
    order_time: o.orderTime || o.order_time || '',
    history: Array.isArray(o.history) ? o.history : [],
    verified_at: o.verifiedAt || o.verified_at || null
  };
}

function mapSettingsFromDb(row) {
  return {
    storeName: row.store_name || 'FREONIX XII-F1',
    eventDate: row.event_date || '2026-09-23',
    eventDateDisplay: row.event_date_display || '23 September 2026',
    adminPhone: row.admin_phone || '6287856624994',
    currency: row.currency || 'IDR',
    lowStockThreshold: Number(row.low_stock_threshold) || 5,
    storeStatus: row.store_status || 'open',
    orderPrefix: row.order_prefix || 'FRX',
    updatedAt: row.updated_at
  };
}

function mapSettingsToDb(s) {
  return {
    id: 'default',
    store_name: s.storeName,
    event_date: s.eventDate,
    event_date_display: s.eventDateDisplay,
    admin_phone: s.adminPhone,
    currency: s.currency || 'IDR',
    low_stock_threshold: Number(s.lowStockThreshold) || 5,
    store_status: s.storeStatus || 'open',
    order_prefix: s.orderPrefix || 'FRX',
    updated_at: new Date().toISOString()
  };
}

function mapNotificationFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message || '',
    type: row.type || 'info',
    read: Boolean(row.read),
    time: row.time || '',
    createdAt: row.created_at
  };
}

function mapNotificationToDb(n) {
  return {
    id: n.id,
    title: n.title,
    message: n.message || '',
    type: n.type || 'info',
    read: Boolean(n.read),
    time: n.time || '',
    created_at: n.createdAt || new Date().toISOString()
  };
}

function mapAuditLogFromDb(row) {
  return {
    id: row.id,
    action: row.action,
    details: row.details || '',
    actor: row.actor || 'Admin',
    time: row.time || '',
    createdAt: row.created_at
  };
}

function mapAuditLogToDb(l) {
  return {
    id: l.id,
    action: l.action,
    details: l.details || '',
    actor: l.actor || 'Admin',
    time: l.time || '',
    created_at: l.createdAt || new Date().toISOString()
  };
}

// In-memory cache
let cachedDb = null;
let isSyncing = false;
let syncStatus = {
  lastSync: null,
  connected: false,
  error: null
};

function loadLocalDb() {
  if (cachedDb) return cachedDb;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DB_KEY) : null;
    if (!raw) {
      cachedDb = JSON.parse(JSON.stringify(INITIAL_DB));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DB_KEY, JSON.stringify(cachedDb));
      }
      return cachedDb;
    }
    const parsed = JSON.parse(raw);
    cachedDb = {
      settings: { ...INITIAL_DB.settings, ...(parsed.settings || {}) },
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : INITIAL_DB.categories,
      products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : INITIAL_DB.products,
      orders: [], // Pesanan selalu dimuat langsung dari Supabase, bukan dari localStorage
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
    };
    return cachedDb;
  } catch (err) {
    console.error('Error loading local DB cache:', err);
    cachedDb = JSON.parse(JSON.stringify(INITIAL_DB));
    return cachedDb;
  }
}

function saveLocalDb(data) {
  cachedDb = data;
  try {
    if (typeof localStorage !== 'undefined') {
      // Hanya cache pengaturan, kategori, dan produk untuk performa UI offline.
      // JANGAN menyimpan data pesanan (orders) ke localStorage agar tidak terjadi bias antar-browser.
      const persistentData = {
        settings: data.settings,
        categories: data.categories,
        products: data.products
      };
      localStorage.setItem(DB_KEY, JSON.stringify(persistentData));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('freonix_db_updated', { detail: { timestamp: Date.now() } }));
    }
  } catch (err) {
    console.error('Error saving local DB cache:', err);
  }
}

// Inisialisasi awal
loadLocalDb();

// --- SUPABASE DATA SYNCHRONIZATION ---

async function fetchFromSupabase() {
  if (!isSupabaseConfigured || isSyncing) return;
  isSyncing = true;

  try {
    const data = loadLocalDb();
    let hasUpdates = false;

    // 1. Fetch Store Settings
    const { data: remoteSettings, error: settingsError } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!settingsError && remoteSettings) {
      data.settings = { ...data.settings, ...mapSettingsFromDb(remoteSettings) };
      hasUpdates = true;
    }

    // 2. Fetch Categories
    const { data: remoteCategories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (!catError && Array.isArray(remoteCategories) && remoteCategories.length > 0) {
      data.categories = remoteCategories.map(mapCategoryFromDb);
      hasUpdates = true;
    }

    // 3. Fetch Products
    const { data: remoteProducts, error: prodError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (!prodError && Array.isArray(remoteProducts) && remoteProducts.length > 0) {
      data.products = remoteProducts.map(mapProductFromDb);
      hasUpdates = true;
    }

    // 4. Fetch Orders
    const { data: remoteOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!ordersError && Array.isArray(remoteOrders) && remoteOrders.length > 0) {
      data.orders = remoteOrders.map(mapOrderFromDb);
      hasUpdates = true;
    }

    // 5. Fetch Notifications
    const { data: remoteNotifs, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!notifError && Array.isArray(remoteNotifs)) {
      data.notifications = remoteNotifs.map(mapNotificationFromDb);
      hasUpdates = true;
    }

    // 6. Fetch Audit Logs
    const { data: remoteLogs, error: logError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!logError && Array.isArray(remoteLogs)) {
      data.auditLogs = remoteLogs.map(mapAuditLogFromDb);
      hasUpdates = true;
    }

    syncStatus = {
      lastSync: new Date().toISOString(),
      connected: true,
      error: null
    };

    if (hasUpdates) {
      saveLocalDb(data);
    }
  } catch (err) {
    console.warn('Sync with Supabase notice:', err.message);
    syncStatus = {
      lastSync: new Date().toISOString(),
      connected: false,
      error: err.message
    };
  } finally {
    isSyncing = false;
  }
}

// --- SETUP SUPABASE REALTIME SUBSCRIPTION ---
let realtimeChannel = null;

function setupRealtime() {
  if (!isSupabaseConfigured || typeof window === 'undefined' || realtimeChannel) return;

  try {
    realtimeChannel = supabase
      .channel('freonix_realtime_sync')
      // Categories changes
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, payload => {
        const data = loadLocalDb();
        if (payload.eventType === 'INSERT') {
          const item = mapCategoryFromDb(payload.new);
          if (!data.categories.some(c => c.id === item.id)) {
            data.categories.push(item);
            saveLocalDb(data);
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = mapCategoryFromDb(payload.new);
          data.categories = data.categories.map(c => c.id === item.id ? item : c);
          saveLocalDb(data);
        } else if (payload.eventType === 'DELETE') {
          data.categories = data.categories.filter(c => c.id !== payload.old.id);
          saveLocalDb(data);
        }
      })
      // Products changes
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
        const data = loadLocalDb();
        if (payload.eventType === 'INSERT') {
          const item = mapProductFromDb(payload.new);
          if (!data.products.some(p => p.id === item.id)) {
            data.products.push(item);
            saveLocalDb(data);
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = mapProductFromDb(payload.new);
          data.products = data.products.map(p => p.id === item.id ? item : p);
          saveLocalDb(data);
        } else if (payload.eventType === 'DELETE') {
          data.products = data.products.filter(p => p.id !== payload.old.id);
          saveLocalDb(data);
        }
      })
      // Orders changes
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        const data = loadLocalDb();
        if (payload.eventType === 'INSERT') {
          const item = mapOrderFromDb(payload.new);
          if (!data.orders.some(o => o.orderId === item.orderId)) {
            data.orders.unshift(item);
            saveLocalDb(data);
          }
        } else if (payload.eventType === 'UPDATE') {
          const item = mapOrderFromDb(payload.new);
          data.orders = data.orders.map(o => o.orderId === item.orderId ? item : o);
          saveLocalDb(data);
        } else if (payload.eventType === 'DELETE') {
          data.orders = data.orders.filter(o => o.orderId !== payload.old.id);
          saveLocalDb(data);
        }
      })
      // Settings changes
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, payload => {
        if (payload.new && payload.new.id === 'default') {
          const data = loadLocalDb();
          data.settings = { ...data.settings, ...mapSettingsFromDb(payload.new) };
          saveLocalDb(data);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connected
        }
      });
  } catch (err) {
    console.warn('Realtime subscription notice:', err.message);
  }
}

// Mulai sinkronisasi dan realtime jika di browser
if (typeof window !== 'undefined') {
  fetchFromSupabase();
  setupRealtime();
}

// --- DB INTERFACE EXPORT ---

export const db = {
  // --- LIFECYCLE & SYNC ---
  getRawData() {
    return loadLocalDb();
  },
  getSyncStatus() {
    return syncStatus;
  },
  async syncNow() {
    await fetchFromSupabase();
    return syncStatus;
  },
  resetToInitial() {
    const fresh = JSON.parse(JSON.stringify(INITIAL_DB));
    saveLocalDb(fresh);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('freonix_last_order');
      }
    } catch (e) {}

    // Reset ke Supabase secara async jika tabel sudah dibuat
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('store_settings').upsert(mapSettingsToDb(fresh.settings));
          for (const cat of fresh.categories) {
            await supabase.from('categories').upsert(mapCategoryToDb(cat));
          }
          for (const prod of fresh.products) {
            await supabase.from('products').upsert(mapProductToDb(prod));
          }
        } catch (e) {
          console.warn('Gagal sinkron reset ke Supabase:', e);
        }
      })();
    }

    this.addAuditLog('RESET_DATABASE', 'Database direset ke kondisi awal dengan menu standar');
    return fresh;
  },

  // --- SETTINGS ---
  getSettings() {
    return loadLocalDb().settings;
  },
  updateSettings(newSettings) {
    const data = loadLocalDb();
    data.settings = { ...data.settings, ...newSettings, updatedAt: new Date().toISOString() };
    saveLocalDb(data);

    // Kirim ke Supabase
    if (isSupabaseConfigured) {
      supabase
        .from('store_settings')
        .upsert(mapSettingsToDb(data.settings))
        .then(({ error }) => {
          if (error) console.warn('Supabase updateSettings warning:', error.message);
        })
        .catch(err => console.warn('Supabase updateSettings err:', err));
    }

    this.addAuditLog('UPDATE_SETTINGS', 'Memperbarui pengaturan sistem toko');
    return data.settings;
  },

  // --- CATEGORIES ---
  getCategories() {
    return loadLocalDb().categories;
  },
  getActiveCategories() {
    return loadLocalDb().categories.filter(c => c.status === 'active');
  },
  getCategoryById(id) {
    return loadLocalDb().categories.find(c => c.id === id || c.slug === id);
  },
  createCategory(cat) {
    const data = loadLocalDb();
    const slug = (cat.slug || cat.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newCat = {
      id: cat.id || `cat-${Date.now()}`,
      slug: slug || `cat-${Date.now()}`,
      name: cat.name,
      description: cat.description || '',
      status: cat.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.categories.push(newCat);
    saveLocalDb(data);

    // Kirim ke Supabase
    if (isSupabaseConfigured) {
      supabase
        .from('categories')
        .upsert(mapCategoryToDb(newCat))
        .then(({ error }) => {
          if (error) console.warn('Supabase createCategory warning:', error.message);
        })
        .catch(err => console.warn('Supabase createCategory err:', err));
    }

    this.addAuditLog('CREATE_CATEGORY', `Membuat kategori: ${newCat.name}`);
    return newCat;
  },
  addCategory(cat) {
    return this.createCategory(cat);
  },
  updateCategory(id, updates) {
    const data = loadLocalDb();
    data.categories = data.categories.map(c => {
      if (c.id === id || c.slug === id) {
        return { ...c, ...updates, updatedAt: new Date().toISOString() };
      }
      return c;
    });

    if (updates.name) {
      data.products = data.products.map(p => {
        if (p.categoryId === id) {
          return { ...p, categoryName: updates.name };
        }
        return p;
      });
    }

    saveLocalDb(data);
    const updated = data.categories.find(c => c.id === id);

    // Kirim ke Supabase
    if (isSupabaseConfigured && updated) {
      supabase
        .from('categories')
        .update(mapCategoryToDb(updated))
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateCategory warning:', error.message);
        })
        .catch(err => console.warn('Supabase updateCategory err:', err));
    }

    this.addAuditLog('UPDATE_CATEGORY', `Memperbarui kategori ID ${id}`);
    return updated;
  },
  deleteCategory(id) {
    const data = loadLocalDb();
    const inUse = data.products.some(p => p.categoryId === id);
    if (inUse) {
      throw new Error('Kategori tidak dapat dihapus karena masih digunakan oleh produk aktif!');
    }
    const cat = data.categories.find(c => c.id === id);
    data.categories = data.categories.filter(c => c.id !== id);
    saveLocalDb(data);

    // Hapus dari Supabase
    if (isSupabaseConfigured) {
      supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteCategory warning:', error.message);
        })
        .catch(err => console.warn('Supabase deleteCategory err:', err));
    }

    this.addAuditLog('DELETE_CATEGORY', `Menghapus kategori: ${cat?.name || id}`);
    return true;
  },

  // --- PRODUCTS ---
  getProducts() {
    return loadLocalDb().products;
  },
  getActiveProducts() {
    return loadLocalDb().products.filter(p => p.status === 'active');
  },
  getProductById(id) {
    const prods = loadLocalDb().products;
    return prods.find(p => 
      p.id === id || 
      p.slug === id ||
      (id === '1' && (p.id === 'kwek-kwek' || p.slug === 'kwek-kwek')) ||
      (id === '2' && (p.id === 'chicken-adobo' || p.slug === 'chicken-adobo')) ||
      (id === '3' && (p.id === 'halo-halo' || p.slug === 'halo-halo'))
    );
  },
  createProduct(prod) {
    const data = loadLocalDb();
    const slug = (prod.slug || prod.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    let finalId = slug || `prod-${Date.now()}`;
    if (data.products.some(p => p.id === finalId)) {
      finalId = `${finalId}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const cat = data.categories.find(c => c.id === prod.categoryId) || {};

    const newProd = {
      id: finalId,
      slug,
      name: prod.name,
      categoryId: prod.categoryId || (data.categories[0]?.id || ''),
      categoryName: cat.name || prod.categoryName || 'Menu Umum',
      price: Number(prod.price) || 0,
      discountPrice: Number(prod.discountPrice) || 0,
      stock: Math.max(0, Number(prod.stock) || 0),
      unit: prod.unit || 'porsi',
      status: prod.status || 'active',
      desc: prod.desc || prod.description || '',
      description: prod.desc || prod.description || '',
      image: prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      waLink: prod.waLink || 'https://wa.link/ewddmf',
      ingredients: prod.ingredients || [],
      tools: prod.tools || [],
      nutrition: prod.nutrition || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.products.push(newProd);
    saveLocalDb(data);

    // Simpan ke Supabase
    if (isSupabaseConfigured) {
      supabase
        .from('products')
        .upsert(mapProductToDb(newProd))
        .then(({ error }) => {
          if (error) console.warn('Supabase createProduct warning:', error.message);
        })
        .catch(err => console.warn('Supabase createProduct err:', err));
    }

    this.addAuditLog('ADD_PRODUCT', `Menambahkan produk baru: ${newProd.name}`);
    return newProd;
  },
  addProduct(prod) {
    return this.createProduct(prod);
  },
  updateProduct(id, updates) {
    const data = loadLocalDb();
    const cat = updates.categoryId ? data.categories.find(c => c.id === updates.categoryId) : null;

    data.products = data.products.map(p => {
      if (p.id === id || p.slug === id) {
        return {
          ...p,
          ...updates,
          categoryName: cat ? cat.name : (updates.categoryName || p.categoryName),
          price: updates.price !== undefined ? Number(updates.price) : p.price,
          stock: updates.stock !== undefined ? Math.max(0, Number(updates.stock)) : p.stock,
          desc: updates.desc !== undefined ? updates.desc : (updates.description !== undefined ? updates.description : p.desc),
          description: updates.description !== undefined ? updates.description : (updates.desc !== undefined ? updates.desc : p.description),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    saveLocalDb(data);
    const updated = data.products.find(p => p.id === id);

    // Kirim perubahan ke Supabase
    if (isSupabaseConfigured && updated) {
      supabase
        .from('products')
        .update(mapProductToDb(updated))
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateProduct warning:', error.message);
        })
        .catch(err => console.warn('Supabase updateProduct err:', err));
    }

    this.addAuditLog('UPDATE_PRODUCT', `Memperbarui produk ID ${id}`);
    return updated;
  },
  deleteProduct(id) {
    const data = loadLocalDb();
    const prod = data.products.find(p => p.id === id);
    data.products = data.products.filter(p => p.id !== id);
    saveLocalDb(data);

    // Hapus dari Supabase
    if (isSupabaseConfigured) {
      supabase
        .from('products')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteProduct warning:', error.message);
        })
        .catch(err => console.warn('Supabase deleteProduct err:', err));
    }

    this.addAuditLog('DELETE_PRODUCT', `Menghapus produk: ${prod?.name || id}`);
    return true;
  },
  adjustStock(id, delta) {
    const data = loadLocalDb();
    let updatedProd = null;
    data.products = data.products.map(p => {
      if (p.id === id || p.slug === id) {
        const newStock = Math.max(0, (p.stock || 0) + delta);
        updatedProd = { ...p, stock: newStock, updatedAt: new Date().toISOString() };
        return updatedProd;
      }
      return p;
    });

    saveLocalDb(data);

    if (isSupabaseConfigured && updatedProd) {
      supabase
        .from('products')
        .update({ stock: updatedProd.stock, updated_at: updatedProd.updatedAt })
        .eq('id', updatedProd.id)
        .then(({ error }) => {
          if (error) console.warn('Supabase adjustStock warning:', error.message);
        })
        .catch(err => console.warn('Supabase adjustStock err:', err));
    }

    // Cek jika low stock
    const threshold = data.settings.lowStockThreshold || 5;
    if (updatedProd && updatedProd.stock <= threshold && updatedProd.stock > 0) {
      this.addNotification({
        title: '⚠️ Stok Menipis (Low Stock)',
        message: `Stok ${updatedProd.name} tersisa ${updatedProd.stock} ${updatedProd.unit}.`,
        type: 'warning'
      });
    } else if (updatedProd && updatedProd.stock === 0) {
      this.addNotification({
        title: '🚨 Stok Habis (Out of Stock)',
        message: `Produk ${updatedProd.name} telah habis terjual!`,
        type: 'danger'
      });
    }

    return updatedProd;
  },

  // --- ORDERS ---
  getOrders() {
    return cachedDb?.orders || [];
  },
  async fetchOrders() {
    if (!isSupabaseConfigured) return cachedDb?.orders || [];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Gagal mengambil orders dari Supabase:', error.message);
      throw error;
    }
    const mapped = (data || []).map(mapOrderFromDb);
    if (cachedDb) {
      cachedDb.orders = mapped;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('freonix_db_updated', { detail: { timestamp: Date.now() } }));
    }
    return mapped;
  },
  async getOrderByIdAsync(id) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return mapOrderFromDb(data);
        }
      } catch (e) {
        console.warn('Supabase getOrderByIdAsync error:', e);
      }
    }
    return this.getOrderById(id);
  },
  getOrderById(id) {
    return (cachedDb?.orders || []).find(o => o.orderId === id || o.id === id);
  },
  async createOrder(orderData) {
    const data = loadLocalDb();
    const orderId = orderData.orderId || `FRX-${Date.now()}`;
    const newOrder = {
      ...orderData,
      id: orderId,
      orderId: orderId,
      orderStatus: orderData.orderStatus || 'Pending',
      paymentStatus: orderData.paymentStatus || 'PENDING',
      orderTime: orderData.orderTime || new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      history: orderData.history || [
        { status: 'Pending', time: new Date().toLocaleString('id-ID'), note: 'Pesanan masuk dari pelanggan' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Kurangi stok produk secara otomatis di database Supabase
    for (const item of (newOrder.items || [])) {
      const p = data.products.find(prod => prod.id === item.id || prod.name === item.name);
      if (p) {
        p.stock = Math.max(0, (p.stock || 0) - (item.qty || 1));
        p.updatedAt = new Date().toISOString();
        if (isSupabaseConfigured) {
          try {
            await supabase.from('products').update({ stock: p.stock, updated_at: p.updatedAt }).eq('id', p.id);
          } catch (e) {
            console.warn('Supabase stock update error:', e);
          }
        }
      }
    }

    // 2. SIMPAN KE SUPABASE SEBAGAI DATABASE UTAMA
    if (isSupabaseConfigured) {
      const orderPayload = mapOrderToDb(newOrder);
      const { error } = await supabase
        .from('orders')
        .insert(orderPayload);

      if (error) {
        console.error('Supabase createOrder error:', error);
        throw new Error(error.message);
      }
    }

    // Simpan ke in-memory cache sementara untuk tab aktif
    data.orders = [newOrder, ...(data.orders || []).filter(o => o.orderId !== orderId)];
    saveLocalDb(data);

    // Buat notifikasi pesanan baru
    this.addNotification({
      title: '🔔 Pesanan Baru Diterima',
      message: `Pesanan #${newOrder.orderId} dari ${newOrder.name} (${newOrder.kelas}) senilai Rp ${Number(newOrder.totalHarga).toLocaleString('id-ID')}.`,
      type: 'order'
    });
    this.addAuditLog('CREATE_ORDER', `Pesanan #${newOrder.orderId} dibuat oleh ${newOrder.name}`);

    return newOrder;
  },
  async updateOrderStatus(orderId, newStatus, note = '') {
    const data = loadLocalDb();
    let updatedOrder = null;

    data.orders = (data.orders || []).map(o => {
      if (o.orderId === orderId || o.id === orderId) {
        const history = o.history || [];
        history.push({
          status: newStatus,
          time: new Date().toLocaleString('id-ID'),
          note: note || `Status diubah menjadi ${newStatus} oleh Admin`
        });
        updatedOrder = {
          ...o,
          orderStatus: newStatus,
          history,
          updatedAt: new Date().toISOString()
        };
        return updatedOrder;
      }
      return o;
    });

    // Update di Supabase
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('orders')
        .update({
          order_status: updatedOrder ? updatedOrder.orderStatus : newStatus,
          history: updatedOrder ? updatedOrder.history : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Supabase updateOrderStatus error:', error);
        throw new Error(error.message);
      }
    }

    saveLocalDb(data);
    this.addAuditLog('UPDATE_ORDER_STATUS', `Status order #${orderId} diubah ke ${newStatus}`);
    return updatedOrder;
  },
  async updatePaymentStatus(orderId, newPaymentStatus) {
    const data = loadLocalDb();
    let updatedOrder = null;

    data.orders = (data.orders || []).map(o => {
      if (o.orderId === orderId || o.id === orderId) {
        updatedOrder = {
          ...o,
          paymentStatus: newPaymentStatus,
          orderStatus: newPaymentStatus === 'SUCCESS' && o.orderStatus === 'Pending' ? 'Processing' : o.orderStatus,
          verifiedAt: newPaymentStatus === 'SUCCESS' ? new Date().toLocaleString('id-ID') : null,
          updatedAt: new Date().toISOString()
        };
        return updatedOrder;
      }
      return o;
    });

    // Sinkronkan ke local user jika sama
    try {
      if (typeof localStorage !== 'undefined') {
        const activeRaw = localStorage.getItem('freonix_last_order');
        if (activeRaw) {
          const active = JSON.parse(activeRaw);
          if (active.orderId === orderId) {
            active.paymentStatus = newPaymentStatus;
            localStorage.setItem('freonix_last_order', JSON.stringify(active));
          }
        }
      }
    } catch (e) {}

    // Update di Supabase
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: newPaymentStatus,
          order_status: newPaymentStatus === 'SUCCESS' ? 'Processing' : undefined,
          verified_at: newPaymentStatus === 'SUCCESS' ? new Date().toLocaleString('id-ID') : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Supabase updatePaymentStatus error:', error);
        throw new Error(error.message);
      }
    }

    saveLocalDb(data);
    this.addAuditLog('UPDATE_PAYMENT', `Pembayaran order #${orderId} diubah ke ${newPaymentStatus}`);
    return updatedOrder;
  },
  async deleteOrder(orderId) {
    const data = loadLocalDb();
    data.orders = (data.orders || []).filter(o => o.orderId !== orderId && o.id !== orderId);

    // Hapus dari Supabase
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Supabase deleteOrder error:', error);
        throw new Error(error.message);
      }
    }

    saveLocalDb(data);
    this.addAuditLog('DELETE_ORDER', `Menghapus pesanan #${orderId}`);
    return true;
  },

  // --- CUSTOMERS (Derived from Orders) ---
  getCustomers() {
    const orders = cachedDb?.orders || [];
    const customerMap = {};

    orders.forEach(o => {
      const key = `${o.name}_${o.kelas}`.toLowerCase().trim();
      if (!customerMap[key]) {
        customerMap[key] = {
          id: key,
          name: o.name,
          kelas: o.kelas,
          phone: o.phone || '-',
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: o.orderTime,
          orders: []
        };
      }
      customerMap[key].totalOrders += 1;
      customerMap[key].totalSpent += (o.totalHarga || 0);
      customerMap[key].orders.push(o);
    });

    return Object.values(customerMap);
  },
  getCustomerById(id) {
    const customers = this.getCustomers();
    return customers.find(c => c.id === id);
  },

  // --- NOTIFICATIONS ---
  getNotifications() {
    return loadLocalDb().notifications;
  },
  addNotification(notif) {
    const data = loadLocalDb();
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      read: false,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      ...notif
    };
    data.notifications.unshift(newNotif);
    saveLocalDb(data);

    // Simpan ke Supabase jika ada sesi admin
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: authData }) => {
        if (authData?.session) {
          supabase
            .from('notifications')
            .insert(mapNotificationToDb(newNotif))
            .catch(err => console.warn('Supabase addNotification err:', err));
        }
      }).catch(() => {});
    }
  },
  markNotificationRead(id) {
    const data = loadLocalDb();
    data.notifications = data.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveLocalDb(data);

    if (isSupabaseConfigured) {
      supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase markNotificationRead warning:', error.message);
        })
        .catch(err => console.warn('Supabase markNotificationRead err:', err));
    }
  },
  clearNotifications() {
    const data = loadLocalDb();
    data.notifications = [];
    saveLocalDb(data);

    if (isSupabaseConfigured) {
      supabase
        .from('notifications')
        .delete()
        .neq('id', '')
        .then(({ error }) => {
          if (error) console.warn('Supabase clearNotifications warning:', error.message);
        })
        .catch(err => console.warn('Supabase clearNotifications err:', err));
    }
  },

  // --- AUDIT LOGS ---
  getAuditLogs() {
    return loadLocalDb().auditLogs;
  },
  addAuditLog(action, details, actor = 'Admin') {
    const data = loadLocalDb();
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      actor,
      time: new Date().toLocaleString('id-ID'),
      createdAt: new Date().toISOString()
    };
    data.auditLogs.unshift(newLog);
    if (data.auditLogs.length > 100) data.auditLogs = data.auditLogs.slice(0, 100);
    saveLocalDb(data);

    // Simpan ke Supabase jika ada sesi admin
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: authData }) => {
        if (authData?.session) {
          supabase
            .from('audit_logs')
            .insert(mapAuditLogToDb(newLog))
            .catch(err => console.warn('Supabase addAuditLog err:', err));
        }
      }).catch(() => {});
    }
  },

  // --- ANALYTICS STATS ---
  getStats() {
    const data = cachedDb || loadLocalDb();
    const { products, orders, settings } = data;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalHarga || 0), 0);
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.paymentStatus === 'PENDING').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    const threshold = settings.lowStockThreshold || 5;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0).length;
    const lowStockProducts = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= threshold).length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalProducts: products.length,
      activeProducts,
      outOfStockProducts,
      lowStockProducts
    };
  }
};
