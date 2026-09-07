// src/utils/db.js
// FREONIX Unified Database with Firebase Cloud Firestore as Primary Backend

import {
  isFirebaseConfigured,
  fetchStoreSettings,
  saveStoreSettings,
  fetchCategories as fbFetchCategories,
  saveCategory as fbSaveCategory,
  deleteCategory as fbDeleteCategory,
  fetchProducts as fbFetchProducts,
  saveProduct as fbSaveProduct,
  updateProductStock as fbUpdateStock,
  deleteProduct as fbDeleteProduct,
  fetchOrders as fbFetchOrders,
  fetchOrderById as fbFetchOrderById,
  saveOrder as fbSaveOrder,
  updateOrder as fbUpdateOrder,
  deleteOrder as fbDeleteOrder,
  fetchNotifications as fbFetchNotifications,
  saveNotification as fbSaveNotification,
  updateNotification as fbUpdateNotification,
  clearAllNotifications as fbClearNotifications,
  fetchAuditLogs as fbFetchAuditLogs,
  saveAuditLog as fbSaveAuditLog,
  subscribeToOrders as fbSubOrders,
  subscribeToProducts as fbSubProducts,
  subscribeToCategories as fbSubCategories,
  subscribeToStoreSettings as fbSubSettings
} from './firebase.js';

const DB_KEY = 'freonix_database_v3';

// Data default awal sebagai template seeding dan fallback offline
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

// In-memory cache
let cachedDb = null;
let isSyncing = false;
let syncStatus = {
  lastSync: null,
  connected: false,
  error: null
};

// Unsubscribe handlers for cleanup
let unsubscribeHandlers = [];

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
      orders: [], // Pesanan selalu dimuat dari Firebase secara langsung
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
loadLocalDb();

// --- FIREBASE DATA SYNCHRONIZATION ---

async function fetchFromFirebase() {
  if (!isFirebaseConfigured || isSyncing) return;
  isSyncing = true;

  try {
    const data = loadLocalDb();
    let hasUpdates = false;

    // 1. Fetch Store Settings
    const remoteSettings = await fetchStoreSettings();
    if (remoteSettings) {
      data.settings = { ...data.settings, ...remoteSettings };
      hasUpdates = true;
    }

    // 2. Fetch Categories
    const remoteCategories = await fbFetchCategories();
    if (Array.isArray(remoteCategories) && remoteCategories.length > 0) {
      data.categories = remoteCategories;
      hasUpdates = true;
    }

    // 3. Fetch Products
    const remoteProducts = await fbFetchProducts();
    if (Array.isArray(remoteProducts) && remoteProducts.length > 0) {
      data.products = remoteProducts;
      hasUpdates = true;
    }

    // 4. Fetch Orders
    const remoteOrders = await fbFetchOrders();
    if (Array.isArray(remoteOrders)) {
      data.orders = remoteOrders;
      hasUpdates = true;
    }

    // 5. Fetch Notifications
    const remoteNotifs = await fbFetchNotifications();
    if (Array.isArray(remoteNotifs)) {
      data.notifications = remoteNotifs;
      hasUpdates = true;
    }

    // 6. Fetch Audit Logs
    const remoteLogs = await fbFetchAuditLogs();
    if (Array.isArray(remoteLogs)) {
      data.auditLogs = remoteLogs;
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
    console.warn('Sync with Firebase notice:', err.message);
    syncStatus = {
      lastSync: new Date().toISOString(),
      connected: false,
      error: err.message
    };
  } finally {
    isSyncing = false;
  }
}

// --- SETUP FIREBASE REALTIME LISTENERS ---

function setupRealtime() {
  if (!isFirebaseConfigured || typeof window === 'undefined' || unsubscribeHandlers.length > 0) return;

  try {
    // 1. Categories Realtime
    const unsubCat = fbSubCategories((categories) => {
      if (Array.isArray(categories) && categories.length > 0) {
        const data = loadLocalDb();
        data.categories = categories;
        saveLocalDb(data);
      }
    });
    unsubscribeHandlers.push(unsubCat);

    // 2. Products Realtime
    const unsubProd = fbSubProducts((products) => {
      if (Array.isArray(products) && products.length > 0) {
        const data = loadLocalDb();
        data.products = products;
        saveLocalDb(data);
      }
    });
    unsubscribeHandlers.push(unsubProd);

    // 3. Orders Realtime
    const unsubOrders = fbSubOrders((orders) => {
      if (Array.isArray(orders)) {
        const data = loadLocalDb();
        data.orders = orders;
        saveLocalDb(data);
      }
    });
    unsubscribeHandlers.push(unsubOrders);

    // 4. Settings Realtime
    const unsubSettings = fbSubSettings((settings) => {
      if (settings) {
        const data = loadLocalDb();
        data.settings = { ...data.settings, ...settings };
        saveLocalDb(data);
      }
    });
    unsubscribeHandlers.push(unsubSettings);
  } catch (err) {
    console.warn('Firebase Realtime subscription notice:', err.message);
  }
}

// Mulai sinkronisasi dan realtime jika di browser
if (typeof window !== 'undefined') {
  fetchFromFirebase();
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
    await fetchFromFirebase();
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

    // Reset ke Firebase Firestore secara async jika terkonfigurasi
    if (isFirebaseConfigured) {
      (async () => {
        try {
          await saveStoreSettings(fresh.settings);
          for (const cat of fresh.categories) {
            await fbSaveCategory(cat);
          }
          for (const prod of fresh.products) {
            await fbSaveProduct(prod);
          }
        } catch (e) {
          console.warn('Gagal sinkron reset ke Firebase:', e);
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

    // Kirim ke Firebase Firestore
    if (isFirebaseConfigured) {
      saveStoreSettings(data.settings).catch(err => console.warn('Firebase updateSettings err:', err));
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

    // Kirim ke Firebase Firestore
    if (isFirebaseConfigured) {
      fbSaveCategory(newCat).catch(err => console.warn('Firebase createCategory err:', err));
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

    // Kirim ke Firebase Firestore
    if (isFirebaseConfigured && updated) {
      fbSaveCategory(updated).catch(err => console.warn('Firebase updateCategory err:', err));
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

    // Hapus dari Firebase Firestore
    if (isFirebaseConfigured) {
      fbDeleteCategory(id).catch(err => console.warn('Firebase deleteCategory err:', err));
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

    // Simpan ke Firebase Firestore
    if (isFirebaseConfigured) {
      fbSaveProduct(newProd).catch(err => console.warn('Firebase createProduct err:', err));
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

    // Kirim ke Firebase Firestore
    if (isFirebaseConfigured && updated) {
      fbSaveProduct(updated).catch(err => console.warn('Firebase updateProduct err:', err));
    }

    this.addAuditLog('UPDATE_PRODUCT', `Memperbarui produk ID ${id}`);
    return updated;
  },
  deleteProduct(id) {
    const data = loadLocalDb();
    const prod = data.products.find(p => p.id === id);
    data.products = data.products.filter(p => p.id !== id);
    saveLocalDb(data);

    // Hapus dari Firebase Firestore
    if (isFirebaseConfigured) {
      fbDeleteProduct(id).catch(err => console.warn('Firebase deleteProduct err:', err));
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

    if (isFirebaseConfigured && updatedProd) {
      fbUpdateStock(updatedProd.id, updatedProd.stock).catch(err => console.warn('Firebase adjustStock err:', err));
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
    if (!isFirebaseConfigured) return cachedDb?.orders || [];
    try {
      const orders = await fbFetchOrders();
      if (cachedDb) {
        cachedDb.orders = orders;
      }
      return orders;
    } catch (error) {
      console.warn('Gagal mengambil orders dari Firebase:', error.message);
      throw error;
    }
  },
  async getOrderByIdAsync(id) {
    if (isFirebaseConfigured) {
      try {
        const order = await fbFetchOrderById(id);
        if (order) return order;
      } catch (e) {
        console.warn('Firebase getOrderByIdAsync error:', e);
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

    // 1. Kurangi stok produk secara otomatis di database Firestore & lokal
    for (const item of (newOrder.items || [])) {
      const p = data.products.find(prod => prod.id === item.id || prod.name === item.name);
      if (p) {
        p.stock = Math.max(0, (p.stock || 0) - (item.qty || 1));
        p.updatedAt = new Date().toISOString();
        if (isFirebaseConfigured) {
          fbUpdateStock(p.id, p.stock).catch(e => console.warn('Firebase stock update error:', e));
        }
      }
    }

    // 2. SIMPAN KE FIREBASE FIRESTORE SEBAGAI DATABASE UTAMA
    if (isFirebaseConfigured) {
      try {
        await fbSaveOrder(newOrder);
      } catch (error) {
        console.error('Firebase saveOrder error:', error);
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

    // Update di Firebase Firestore
    if (isFirebaseConfigured) {
      try {
        await fbUpdateOrder(orderId, {
          orderStatus: updatedOrder ? updatedOrder.orderStatus : newStatus,
          history: updatedOrder ? updatedOrder.history : undefined,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Firebase updateOrderStatus error:', error);
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

    // Update di Firebase Firestore
    if (isFirebaseConfigured) {
      try {
        await fbUpdateOrder(orderId, {
          paymentStatus: newPaymentStatus,
          orderStatus: newPaymentStatus === 'SUCCESS' ? 'Processing' : undefined,
          verifiedAt: newPaymentStatus === 'SUCCESS' ? new Date().toLocaleString('id-ID') : null,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Firebase updatePaymentStatus error:', error);
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

    // Hapus dari Firebase Firestore
    if (isFirebaseConfigured) {
      try {
        await fbDeleteOrder(orderId);
      } catch (error) {
        console.error('Firebase deleteOrder error:', error);
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

    // Simpan ke Firebase Firestore
    if (isFirebaseConfigured) {
      fbSaveNotification(newNotif).catch(err => console.warn('Firebase addNotification err:', err));
    }
  },
  markNotificationRead(id) {
    const data = loadLocalDb();
    data.notifications = data.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveLocalDb(data);

    if (isFirebaseConfigured) {
      fbUpdateNotification(id, { read: true }).catch(err => console.warn('Firebase markNotificationRead err:', err));
    }
  },
  clearNotifications() {
    const data = loadLocalDb();
    const ids = data.notifications.map(n => n.id);
    data.notifications = [];
    saveLocalDb(data);

    if (isFirebaseConfigured) {
      fbClearNotifications(ids).catch(err => console.warn('Firebase clearNotifications err:', err));
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

    // Simpan ke Firebase Firestore
    if (isFirebaseConfigured) {
      fbSaveAuditLog(newLog).catch(err => console.warn('Firebase addAuditLog err:', err));
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
