// src/lib/db.js
// FREONIX Unified Database Adapter with InsForge as Primary BaaS Backend

import { insforge, isInsforgeConfigured } from './insforge.js';

const DB_KEY = 'freonix_database_v3';

// Data default awal sebagai fallback dan template seeding
export const INITIAL_DB = {
  settings: {
    storeName: 'FREONIX XII-F1',
    eventDate: '2026-09-23',
    eventDateDisplay: 'Bazar Kokurikuler ASEAN — Masakan Filipina',
    adminPhone: '628818578363',
    currency: 'IDR',
    lowStockThreshold: 5,
    storeStatus: 'open',
    orderPrefix: 'FRX',
    qrisImageUrl: 'https://ie8b79we.ap-southeast.insforge.app/api/storage/buckets/freonix-uploads/objects/branding/qris-freonix.jpg',
    qrisAccountName: 'Jezwu',
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
      price: 3000,
      discountPrice: 0,
      stock: 50,
      unit: 'tusuk',
      status: 'active',
      desc: 'Telur puyuh goreng berbalut tepung dengan rempah spesial, renyah di luar lembut di dalam.',
      description: 'Telur puyuh goreng berbalut tepung dengan rempah spesial, renyah di luar lembut di dalam.',
      image: 'https://ie8b79we.ap-southeast.insforge.app/api/storage/buckets/freonix-uploads/objects/products/kwek-kwek.jpg',
      waLink: 'https://wa.me/628818578363',
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
      updatedAt: '2026-09-16T02:00:00.000Z'
    },
    {
      id: 'turon',
      slug: 'turon',
      name: 'Turon',
      categoryId: 'cat-1',
      categoryName: 'Makanan Ringan',
      price: 3000,
      discountPrice: 0,
      stock: 50,
      unit: 'piece',
      status: 'active',
      desc: 'Pisang goreng golden dengan isian kacang manis, disajikan hangat dan renyah.',
      description: 'Pisang goreng golden dengan isian kacang manis, disajikan hangat dan renyah.',
      image: 'https://ie8b79we.ap-southeast.insforge.app/api/storage/buckets/freonix-uploads/objects/products/turon.jpg',
      waLink: 'https://wa.me/628818578363',
      ingredients: [
        'Pisang kepok matang pilihan (Saba)',
        'Irisan nangka manis segar (Langka)',
        'Kulit lumpia tipis & renyah (Spring roll wrapper)',
        'Gula palem / brown sugar murni (karamelisasi)',
        'Minyak goreng nabati berkualitas',
        'Larutan perekat tepung maizena'
      ],
      tools: [
        'Wajan penggorengan / deep fryer',
        'Penjepit makanan tahan panas',
        'Saringan & rak peniris minyak food grade',
        'Talenan & pisau higienis',
        'Kemasan kertas food grade'
      ],
      nutrition: [
        { label: 'Kalori', value: '195 kkal' },
        { label: 'Karbohidrat', value: '38 g' },
        { label: 'Lemak', value: '5 g' },
        { label: 'Protein', value: '2.5 g' }
      ],
      updatedAt: '2026-09-16T02:00:00.000Z'
    },
    {
      id: 'buko-coklat',
      slug: 'buko-coklat',
      name: 'Buko Coklat',
      categoryId: 'cat-3',
      categoryName: 'Minuman & Dessert',
      price: 6000,
      discountPrice: 0,
      stock: 50,
      unit: 'cup',
      status: 'active',
      desc: 'Sari buko dengan sentuhan cokelat, rasa tropis manis dan lezat untuk ulang tahun.',
      description: 'Sari buko dengan sentuhan cokelat, rasa tropis manis dan lezat untuk ulang tahun.',
      image: 'https://ie8b79we.ap-southeast.insforge.app/api/storage/buckets/freonix-uploads/objects/products/buko-coklat.jpg',
      waLink: 'https://wa.me/628818578363',
      ingredients: [
        'Daging kelapa muda segar serut (Buko)',
        'Jelly cokelat lembut olahan alami',
        'Nata de coco kenyal menyegarkan',
        'Susu evaporasi creamy',
        'Susu kental manis cokelat premium',
        'Bubuk kakao murni / cokelat leleh',
        'Es batu kristal higienis'
      ],
      tools: [
        'Pengerok kelapa muda stainless steril',
        'Wadah pencampur stainless food grade',
        'Sendok takar & pengaduk higienis',
        'Cup dessert anti-tumpah 300ml + sendok'
      ],
      nutrition: [
        { label: 'Kalori', value: '215 kkal' },
        { label: 'Karbohidrat', value: '34 g' },
        { label: 'Lemak', value: '7 g' },
        { label: 'Protein', value: '4 g' }
      ],
      updatedAt: '2026-09-16T02:00:00.000Z'
    }
  ],
  orders: [],
  notifications: [],
  auditLogs: []
};

// --- DATA MAPPERS (InsForge snake_case <-> Application camelCase) ---

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
  const proof = row.payment_proof || row.payment_proof_url || '';
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
    paymentProofImage: proof,
    paymentProofUrl: row.payment_proof_url || (typeof row.payment_proof === 'string' && row.payment_proof.startsWith('http') ? row.payment_proof : ''),
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
  const proof = o.paymentProof || o.paymentProofImage || o.payment_proof || '';
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
    payment_proof: proof,
    payment_proof_url: o.paymentProofUrl || o.payment_proof_url || (typeof proof === 'string' && proof.startsWith('http') ? proof : ''),
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
    adminPhone: row.admin_phone || '628818578363',
    currency: row.currency || 'IDR',
    lowStockThreshold: Number(row.low_stock_threshold) || 5,
    storeStatus: row.store_status || 'open',
    orderPrefix: row.order_prefix || 'FRX',
    qrisImageUrl: row.qris_image_url || 'https://ie8b79we.ap-southeast.insforge.app/api/storage/buckets/freonix-uploads/objects/branding/qris-freonix.jpg',
    qrisAccountName: row.qris_account_name || 'Jezwu',
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
    qris_image_url: s.qrisImageUrl || s.qris_image_url || 'https://ie8b79we.ap-southeast.insforge.app/api/storage/buckets/freonix-uploads/objects/branding/qris-freonix.jpg',
    qris_account_name: s.qrisAccountName || s.qris_account_name || 'Jezwu',
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
let cachedActiveProducts = null;
let cachedProductsRef = null;
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
      products: Array.isArray(parsed.products) && parsed.products.length > 0 
        ? parsed.products.filter(p => p.id !== 'chicken-adobo' && p.id !== 'halo-halo' && p.slug !== 'chicken-adobo' && p.slug !== 'halo-halo')
        : INITIAL_DB.products,
      orders: [],
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
if (typeof window !== 'undefined') {
  loadLocalDb();
}

// --- INSFORGE DATA SYNCHRONIZATION ---

let lastCatalogFetchTime = 0;
const CATALOG_CACHE_TTL = 30000; // 30 seconds debounce

export async function fetchCatalog(force = false) {
  if (!isInsforgeConfigured) return;
  const now = Date.now();
  if (!force && now - lastCatalogFetchTime < CATALOG_CACHE_TTL) {
    return;
  }
  lastCatalogFetchTime = now;

  try {
    const data = loadLocalDb();
    let hasUpdates = false;

    // Fetch Store Settings, Categories, and Products concurrently in parallel
    const [settingsRes, catRes, prodRes] = await Promise.all([
      insforge.database.from('store_settings').select('*').eq('id', 'default').maybeSingle(),
      insforge.database.from('categories').select('*').order('created_at', { ascending: true }),
      insforge.database.from('products').select('*').order('created_at', { ascending: true })
    ]);

    if (!settingsRes.error && settingsRes.data) {
      data.settings = { ...data.settings, ...mapSettingsFromDb(settingsRes.data) };
      hasUpdates = true;
    }

    if (!catRes.error && Array.isArray(catRes.data) && catRes.data.length > 0) {
      data.categories = catRes.data.map(mapCategoryFromDb);
      hasUpdates = true;
    }

    if (!prodRes.error && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
      data.products = prodRes.data.map(mapProductFromDb);
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
    console.warn('Sync catalog with InsForge notice:', err.message);
    syncStatus = {
      lastSync: new Date().toISOString(),
      connected: false,
      error: err.message
    };
  }
}

export async function fetchAdminData() {
  if (!isInsforgeConfigured) return;

  try {
    const data = loadLocalDb();
    let hasUpdates = false;

    const [ordersRes, notifRes, logsRes] = await Promise.all([
      insforge.database.from('orders').select('*').order('created_at', { ascending: false }),
      insforge.database.from('notifications').select('*').order('created_at', { ascending: false }).limit(30),
      insforge.database.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50)
    ]);

    if (!ordersRes.error && Array.isArray(ordersRes.data)) {
      data.orders = ordersRes.data.map(mapOrderFromDb);
      hasUpdates = true;
    }

    if (!notifRes.error && Array.isArray(notifRes.data)) {
      data.notifications = notifRes.data.map(mapNotificationFromDb);
      hasUpdates = true;
    }

    if (!logsRes.error && Array.isArray(logsRes.data)) {
      data.auditLogs = logsRes.data.map(mapAuditLogFromDb);
      hasUpdates = true;
    }

    if (hasUpdates) {
      saveLocalDb(data);
    }
  } catch (err) {
    console.warn('Sync admin data with InsForge notice:', err.message);
  }
}

export async function fetchFromInsforge() {
  if (!isInsforgeConfigured || isSyncing) return;
  isSyncing = true;

  try {
    await fetchCatalog();

    const isAdmin = typeof window !== 'undefined' && (
      sessionStorage.getItem('freonix_admin_auth') === 'true' ||
      localStorage.getItem('freonix_admin_auth') === 'true'
    );

    if (isAdmin) {
      await fetchAdminData();
    }
  } finally {
    isSyncing = false;
  }
}

// Mulai sinkronisasi awal di browser
if (typeof window !== 'undefined') {
  fetchFromInsforge();
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
    await fetchFromInsforge();
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

    this.addAuditLog('RESET_DATABASE', 'Database direset ke kondisi awal dengan menu standar');
    return fresh;
  },

  // --- SETTINGS ---
  getSettings() {
    return loadLocalDb().settings;
  },
  async updateSettings(newSettings) {
    const data = loadLocalDb();
    data.settings = { ...data.settings, ...newSettings, updatedAt: new Date().toISOString() };
    saveLocalDb(data);

    if (isInsforgeConfigured) {
      try {
        const payload = mapSettingsToDb(data.settings);
        // Note: InsForge inserts/upserts require array
        await insforge.database.from('store_settings').update(payload).eq('id', 'default');
      } catch (err) {
        console.warn('InsForge updateSettings err:', err);
      }
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
  async createCategory(cat) {
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

    if (isInsforgeConfigured) {
      try {
        await insforge.database.from('categories').insert([mapCategoryToDb(newCat)]);
      } catch (err) {
        console.warn('InsForge createCategory err:', err);
      }
    }

    this.addAuditLog('CREATE_CATEGORY', `Membuat kategori: ${newCat.name}`);
    return newCat;
  },
  async addCategory(cat) {
    return this.createCategory(cat);
  },
  async updateCategory(id, updates) {
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

    if (isInsforgeConfigured && updated) {
      try {
        await insforge.database.from('categories').update(mapCategoryToDb(updated)).eq('id', id);
      } catch (err) {
        console.warn('InsForge updateCategory err:', err);
      }
    }

    this.addAuditLog('UPDATE_CATEGORY', `Memperbarui kategori ID ${id}`);
    return updated;
  },
  async deleteCategory(id) {
    const data = loadLocalDb();
    const inUse = data.products.some(p => p.categoryId === id);
    if (inUse) {
      throw new Error('Kategori tidak dapat dihapus karena masih digunakan oleh produk aktif!');
    }
    const cat = data.categories.find(c => c.id === id);
    data.categories = data.categories.filter(c => c.id !== id);
    saveLocalDb(data);

    if (isInsforgeConfigured) {
      try {
        await insforge.database.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('InsForge deleteCategory err:', err);
      }
    }

    this.addAuditLog('DELETE_CATEGORY', `Menghapus kategori: ${cat?.name || id}`);
    return true;
  },

  // --- PRODUCTS ---
  getProducts() {
    return loadLocalDb().products;
  },
  getActiveProducts() {
    const prods = loadLocalDb().products || [];
    if (prods === cachedProductsRef && cachedActiveProducts) {
      return cachedActiveProducts;
    }
    cachedProductsRef = prods;
    cachedActiveProducts = prods.filter(p => p.status === 'active');
    return cachedActiveProducts;
  },
  getProductById(id) {
    if (!id) return null;
    const prods = loadLocalDb().products || [];
    const cleanId = String(id).trim().toLowerCase();
    const decodedId = decodeURIComponent(cleanId).toLowerCase();
    const normalized = decodedId.replace(/[^a-z0-9]/g, '');

    // 1. Direct or decoded match on id or slug
    let found = prods.find(p => 
      p.id?.toLowerCase() === cleanId || 
      p.slug?.toLowerCase() === cleanId ||
      p.id?.toLowerCase() === decodedId ||
      p.slug?.toLowerCase() === decodedId
    );
    if (found) return found;

    // 2. Normalized alphanumeric match (ignores hyphens, underscores, spaces)
    if (normalized) {
      found = prods.find(p => {
        const pIdNorm = (p.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const pSlugNorm = (p.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const pNameNorm = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return pIdNorm === normalized || pSlugNorm === normalized || pNameNorm === normalized;
      });
      if (found) return found;
    }

    // 3. Number or common shortcuts
    if (cleanId === '1' || cleanId.startsWith('kwek')) {
      return prods.find(p => p.id === 'kwek-kwek' || p.slug === 'kwek-kwek') || prods[0];
    }
    if (cleanId === '2' || cleanId.includes('turon')) {
      return prods.find(p => p.id === 'turon' || p.slug === 'turon') || prods[1];
    }
    if (cleanId === '3' || cleanId.includes('buko') || cleanId.includes('coklat')) {
      return prods.find(p => p.id === 'buko-coklat' || p.slug === 'buko-coklat') || prods[2];
    }

    const num = parseInt(cleanId, 10);
    if (!isNaN(num) && num >= 1 && num <= prods.length) {
      return prods[num - 1];
    }

    // 4. Substring search if user typed partial name
    found = prods.find(p => 
      (p.id && cleanId.includes(p.id.toLowerCase())) ||
      (p.slug && cleanId.includes(p.slug.toLowerCase())) ||
      (p.name && cleanId.includes(p.name.toLowerCase()))
    );
    return found || null;
  },
  async createProduct(prod) {
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
      waLink: prod.waLink || 'https://wa.me/628818578363',
      ingredients: prod.ingredients || [],
      tools: prod.tools || [],
      nutrition: prod.nutrition || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.products.push(newProd);
    saveLocalDb(data);

    if (isInsforgeConfigured) {
      try {
        await insforge.database.from('products').insert([mapProductToDb(newProd)]);
      } catch (err) {
        console.warn('InsForge createProduct err:', err);
      }
    }

    this.addAuditLog('ADD_PRODUCT', `Menambahkan produk baru: ${newProd.name}`);
    return newProd;
  },
  async addProduct(prod) {
    return this.createProduct(prod);
  },
  async updateProduct(id, updates) {
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

    if (isInsforgeConfigured && updated) {
      try {
        await insforge.database.from('products').update(mapProductToDb(updated)).eq('id', id);
      } catch (err) {
        console.warn('InsForge updateProduct err:', err);
      }
    }

    this.addAuditLog('UPDATE_PRODUCT', `Memperbarui produk ID ${id}`);
    return updated;
  },
  async deleteProduct(id) {
    const data = loadLocalDb();
    const prod = data.products.find(p => p.id === id);
    data.products = data.products.filter(p => p.id !== id);
    saveLocalDb(data);

    if (isInsforgeConfigured) {
      try {
        await insforge.database.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('InsForge deleteProduct err:', err);
      }
    }

    this.addAuditLog('DELETE_PRODUCT', `Menghapus produk: ${prod?.name || id}`);
    return true;
  },
  async adjustStock(id, delta) {
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

    if (isInsforgeConfigured && updatedProd) {
      try {
        await insforge.database.from('products').update({ stock: updatedProd.stock, updated_at: updatedProd.updatedAt }).eq('id', updatedProd.id);
      } catch (err) {
        console.warn('InsForge adjustStock err:', err);
      }
    }

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
    if (!isInsforgeConfigured) return cachedDb?.orders || [];
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Gagal mengambil orders dari InsForge:', error.message);
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
    if (isInsforgeConfigured) {
      try {
        const { data, error } = await insforge.database
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return mapOrderFromDb(data);
        }
      } catch (e) {
        console.warn('InsForge getOrderByIdAsync error:', e);
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

    // 1. Kurangi stok produk secara otomatis di database InsForge
    for (const item of (newOrder.items || [])) {
      const p = data.products.find(prod => prod.id === item.id || prod.name === item.name);
      if (p) {
        p.stock = Math.max(0, (p.stock || 0) - (item.qty || 1));
        p.updatedAt = new Date().toISOString();
        if (isInsforgeConfigured) {
          try {
            await insforge.database.from('products').update({ stock: p.stock, updated_at: p.updatedAt }).eq('id', p.id);
          } catch (e) {
            console.warn('InsForge stock update error:', e);
          }
        }
      }
    }

    // 2. Simpan ke InsForge (Array payload)
    if (isInsforgeConfigured) {
      const orderPayload = mapOrderToDb(newOrder);
      const { error } = await insforge.database
        .from('orders')
        .insert([orderPayload]);

      if (error) {
        console.error('InsForge createOrder error:', error);
        throw new Error(error.message || JSON.stringify(error));
      }
    }

    data.orders = [newOrder, ...(data.orders || []).filter(o => o.orderId !== orderId)];
    saveLocalDb(data);

    try {
      await this.addNotification({
        title: '🔔 Pesanan Baru Diterima',
        message: `Pesanan #${newOrder.orderId} dari ${newOrder.name} (${newOrder.kelas}) senilai Rp ${Number(newOrder.totalHarga).toLocaleString('id-ID')}.`,
        type: 'order'
      });
      await this.addAuditLog('CREATE_ORDER', `Pesanan #${newOrder.orderId} dibuat oleh ${newOrder.name}`);
    } catch (e) {
      console.warn('Background notification notice:', e);
    }

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

    if (isInsforgeConfigured) {
      const { error } = await insforge.database
        .from('orders')
        .update({
          order_status: updatedOrder ? updatedOrder.orderStatus : newStatus,
          history: updatedOrder ? updatedOrder.history : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('InsForge updateOrderStatus error:', error);
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

    if (isInsforgeConfigured) {
      const { error } = await insforge.database
        .from('orders')
        .update({
          payment_status: newPaymentStatus,
          order_status: newPaymentStatus === 'SUCCESS' ? 'Processing' : undefined,
          verified_at: newPaymentStatus === 'SUCCESS' ? new Date().toLocaleString('id-ID') : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('InsForge updatePaymentStatus error:', error);
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

    if (isInsforgeConfigured) {
      const { error } = await insforge.database
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('InsForge deleteOrder error:', error);
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
  async addNotification(notif) {
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

    if (isInsforgeConfigured) {
      try {
        await insforge.database
          .from('notifications')
          .insert([mapNotificationToDb(newNotif)]);
      } catch (err) {
        console.warn('InsForge addNotification err:', err);
      }
    }
  },
  async markNotificationRead(id) {
    const data = loadLocalDb();
    data.notifications = data.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveLocalDb(data);

    if (isInsforgeConfigured) {
      try {
        await insforge.database
          .from('notifications')
          .update({ read: true })
          .eq('id', id);
      } catch (err) {
        console.warn('InsForge markNotificationRead err:', err);
      }
    }
  },
  async clearNotifications() {
    const data = loadLocalDb();
    data.notifications = [];
    saveLocalDb(data);

    if (isInsforgeConfigured) {
      try {
        await insforge.database
          .from('notifications')
          .delete()
          .neq('id', '');
      } catch (err) {
        console.warn('InsForge clearNotifications err:', err);
      }
    }
  },

  // --- AUDIT LOGS ---
  getAuditLogs() {
    return loadLocalDb().auditLogs;
  },
  async addAuditLog(action, details, actor = 'Admin') {
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

    if (isInsforgeConfigured) {
      try {
        await insforge.database
          .from('audit_logs')
          .insert([mapAuditLogToDb(newLog)]);
      } catch (err) {
        console.warn('InsForge addAuditLog err:', err);
      }
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
