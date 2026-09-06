// src/utils/db.js
// FREONIX Unified Database & Single Source of Truth

const DB_KEY = 'freonix_database_v3';

// Data Menu & Kategori yang dikembalikan
const INITIAL_DB = {
  settings: {
    storeName: 'FREONIX XII-F1',
    eventDate: '2026-09-23',
    eventDateDisplay: '23 September 2026',
    adminPhone: '6287856624994',
    currency: 'IDR',
    lowStockThreshold: 5,
    storeStatus: 'open', // 'open' | 'closed'
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

// Pembersihan cache data versi lama otomatis
try {
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem('freonix_database_v2')) {
      localStorage.removeItem('freonix_database_v2');
    }
    if (localStorage.getItem('freonix_database_v1')) {
      localStorage.removeItem('freonix_database_v1');
    }
  }
} catch (e) {}

/**
 * Membaca seluruh data dari localStorage
 */
function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
      return INITIAL_DB;
    }
    const parsed = JSON.parse(raw);
    return {
      settings: { ...INITIAL_DB.settings, ...(parsed.settings || {}) },
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : INITIAL_DB.categories,
      products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : INITIAL_DB.products,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
    };
  } catch (err) {
    console.error('Error loading Freonix DB:', err);
    return INITIAL_DB;
  }
}

/**
 * Menyimpan data ke localStorage dan memicu update event
 */
function saveDb(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('freonix_db_updated', { detail: { timestamp: Date.now() } }));
    }
  } catch (err) {
    console.error('Error saving Freonix DB:', err);
  }
}

export const db = {
  // --- UTILITY / LIFECYCLE ---
  getRawData() {
    return loadDb();
  },
  resetToInitial() {
    saveDb(INITIAL_DB);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('freonix_last_order');
      }
    } catch (e) {}
    this.addAuditLog('RESET_DATABASE', 'Database direset ke kondisi awal dengan menu standar');
    return INITIAL_DB;
  },

  // --- SETTINGS ---
  getSettings() {
    return loadDb().settings;
  },
  updateSettings(newSettings) {
    const data = loadDb();
    data.settings = { ...data.settings, ...newSettings, updatedAt: new Date().toISOString() };
    saveDb(data);
    this.addAuditLog('UPDATE_SETTINGS', 'Memperbarui pengaturan sistem toko');
    return data.settings;
  },

  // --- CATEGORIES ---
  getCategories() {
    return loadDb().categories;
  },
  getActiveCategories() {
    return loadDb().categories.filter(c => c.status === 'active');
  },
  getCategoryById(id) {
    return loadDb().categories.find(c => c.id === id || c.slug === id);
  },
  createCategory(cat) {
    const data = loadDb();
    const slug = (cat.slug || cat.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newCat = {
      id: `cat-${Date.now()}`,
      slug,
      name: cat.name,
      description: cat.description || '',
      status: cat.status || 'active',
      createdAt: new Date().toISOString()
    };
    data.categories.push(newCat);
    saveDb(data);
    this.addAuditLog('CREATE_CATEGORY', `Membuat kategori: ${newCat.name}`);
    return newCat;
  },
  updateCategory(id, updates) {
    const data = loadDb();
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

    saveDb(data);
    this.addAuditLog('UPDATE_CATEGORY', `Memperbarui kategori ID ${id}`);
    return data.categories.find(c => c.id === id);
  },
  deleteCategory(id) {
    const data = loadDb();
    const inUse = data.products.some(p => p.categoryId === id);
    if (inUse) {
      throw new Error('Kategori tidak dapat dihapus karena masih digunakan oleh produk aktif!');
    }
    const cat = data.categories.find(c => c.id === id);
    data.categories = data.categories.filter(c => c.id !== id);
    saveDb(data);
    this.addAuditLog('DELETE_CATEGORY', `Menghapus kategori: ${cat?.name || id}`);
    return true;
  },

  // --- PRODUCTS ---
  getProducts() {
    return loadDb().products;
  },
  getActiveProducts() {
    return loadDb().products.filter(p => p.status === 'active');
  },
  getProductById(id) {
    const prods = loadDb().products;
    return prods.find(p => 
      p.id === id || 
      p.slug === id ||
      (id === '1' && (p.id === 'kwek-kwek' || p.slug === 'kwek-kwek')) ||
      (id === '2' && (p.id === 'chicken-adobo' || p.slug === 'chicken-adobo')) ||
      (id === '3' && (p.id === 'halo-halo' || p.slug === 'halo-halo'))
    );
  },
  createProduct(prod) {
    const data = loadDb();
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
      desc: prod.desc || '',
      image: prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      waLink: prod.waLink || 'https://wa.link/ewddmf',
      ingredients: prod.ingredients || [],
      tools: prod.tools || [],
      nutrition: prod.nutrition || [],
      updatedAt: new Date().toISOString()
    };

    data.products.push(newProd);
    saveDb(data);
    this.addAuditLog('ADD_PRODUCT', `Menambahkan produk baru: ${newProd.name}`);
    return newProd;
  },
  addProduct(prod) {
    return this.createProduct(prod);
  },
  updateProduct(id, updates) {
    const data = loadDb();
    const cat = updates.categoryId ? data.categories.find(c => c.id === updates.categoryId) : null;

    data.products = data.products.map(p => {
      if (p.id === id || p.slug === id) {
        return {
          ...p,
          ...updates,
          categoryName: cat ? cat.name : (updates.categoryName || p.categoryName),
          price: updates.price !== undefined ? Number(updates.price) : p.price,
          stock: updates.stock !== undefined ? Math.max(0, Number(updates.stock)) : p.stock,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    saveDb(data);
    this.addAuditLog('UPDATE_PRODUCT', `Memperbarui produk ID ${id}`);
    return data.products.find(p => p.id === id);
  },
  deleteProduct(id) {
    const data = loadDb();
    const prod = data.products.find(p => p.id === id);
    data.products = data.products.filter(p => p.id !== id);
    saveDb(data);
    this.addAuditLog('DELETE_PRODUCT', `Menghapus produk: ${prod?.name || id}`);
    return true;
  },
  adjustStock(id, delta) {
    const data = loadDb();
    let updatedProd = null;
    data.products = data.products.map(p => {
      if (p.id === id || p.slug === id) {
        const newStock = Math.max(0, (p.stock || 0) + delta);
        updatedProd = { ...p, stock: newStock, updatedAt: new Date().toISOString() };
        return updatedProd;
      }
      return p;
    });

    saveDb(data);

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
    return loadDb().orders;
  },
  getOrderById(id) {
    return loadDb().orders.find(o => o.orderId === id);
  },
  createOrder(orderData) {
    const data = loadDb();
    const newOrder = {
      ...orderData,
      orderStatus: orderData.orderStatus || 'Pending',
      paymentStatus: orderData.paymentStatus || 'PENDING',
      orderTime: orderData.orderTime || new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      history: [
        { status: 'Pending', time: new Date().toLocaleString('id-ID'), note: 'Pesanan masuk dari pelanggan' }
      ]
    };

    // Kurangi stok produk secara otomatis
    (newOrder.items || []).forEach(item => {
      const p = data.products.find(prod => prod.id === item.id || prod.name === item.name);
      if (p) {
        p.stock = Math.max(0, (p.stock || 0) - item.qty);
        // Notifikasi low stock jika perlu
        if (p.stock <= (data.settings.lowStockThreshold || 5)) {
          data.notifications.unshift({
            id: `notif-stock-${Date.now()}`,
            title: p.stock === 0 ? '🚨 Stok Habis' : '⚠️ Stok Menipis',
            message: `${p.name} kini tersisa ${p.stock} ${p.unit}.`,
            type: p.stock === 0 ? 'danger' : 'warning',
            read: false,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    });

    data.orders.unshift(newOrder);

    // Buat notifikasi pesanan baru
    data.notifications.unshift({
      id: `notif-ord-${Date.now()}`,
      title: '🔔 Pesanan Baru Diterima',
      message: `Pesanan #${newOrder.orderId} dari ${newOrder.name} (${newOrder.kelas}) senilai Rp ${Number(newOrder.totalHarga).toLocaleString('id-ID')}.`,
      type: 'order',
      read: false,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });

    saveDb(data);
    this.addAuditLog('CREATE_ORDER', `Pesanan #${newOrder.orderId} dibuat oleh ${newOrder.name}`);
    return newOrder;
  },
  updateOrderStatus(orderId, newStatus, note = '') {
    const data = loadDb();
    data.orders = data.orders.map(o => {
      if (o.orderId === orderId) {
        const history = o.history || [];
        history.push({
          status: newStatus,
          time: new Date().toLocaleString('id-ID'),
          note: note || `Status diubah menjadi ${newStatus} oleh Admin`
        });
        return {
          ...o,
          orderStatus: newStatus,
          history
        };
      }
      return o;
    });

    saveDb(data);
    this.addAuditLog('UPDATE_ORDER_STATUS', `Status order #${orderId} diubah ke ${newStatus}`);
    return data.orders.find(o => o.orderId === orderId);
  },
  updatePaymentStatus(orderId, newPaymentStatus) {
    const data = loadDb();
    data.orders = data.orders.map(o => {
      if (o.orderId === orderId) {
        return {
          ...o,
          paymentStatus: newPaymentStatus,
          orderStatus: newPaymentStatus === 'SUCCESS' && o.orderStatus === 'Pending' ? 'Processing' : o.orderStatus,
          verifiedAt: newPaymentStatus === 'SUCCESS' ? new Date().toLocaleString('id-ID') : null
        };
      }
      return o;
    });

    saveDb(data);

    // Sinkronkan ke local user jika sama
    try {
      const activeRaw = localStorage.getItem('freonix_last_order');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active.orderId === orderId) {
          active.paymentStatus = newPaymentStatus;
          localStorage.setItem('freonix_last_order', JSON.stringify(active));
        }
      }
    } catch (e) {}

    this.addAuditLog('UPDATE_PAYMENT', `Pembayaran order #${orderId} diubah ke ${newPaymentStatus}`);
    return data.orders.find(o => o.orderId === orderId);
  },
  deleteOrder(orderId) {
    const data = loadDb();
    data.orders = data.orders.filter(o => o.orderId !== orderId);
    saveDb(data);
    this.addAuditLog('DELETE_ORDER', `Menghapus pesanan #${orderId}`);
    return true;
  },

  // --- CUSTOMERS (Derived from Orders) ---
  getCustomers() {
    const orders = loadDb().orders;
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
    return loadDb().notifications;
  },
  addNotification(notif) {
    const data = loadDb();
    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      read: false,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      ...notif
    });
    saveDb(data);
  },
  markNotificationRead(id) {
    const data = loadDb();
    data.notifications = data.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveDb(data);
  },
  clearNotifications() {
    const data = loadDb();
    data.notifications = [];
    saveDb(data);
  },

  // --- AUDIT LOGS ---
  getAuditLogs() {
    return loadDb().auditLogs;
  },
  addAuditLog(action, details, actor = 'Admin') {
    const data = loadDb();
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action,
      details,
      actor,
      time: new Date().toLocaleString('id-ID')
    });
    if (data.auditLogs.length > 100) data.auditLogs = data.auditLogs.slice(0, 100);
    saveDb(data);
  },

  // --- ANALYTICS STATS ---
  getStats() {
    const { products, orders, settings } = loadDb();
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
