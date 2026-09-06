// src/utils/orderStore.js
// Centralized order store & state management for FREONIX (Cleaned)

const STORAGE_KEY = 'freonix_orders_v2';

// Inisialisasi awal kosong bersih (tidak ada dummy orders)
const INITIAL_MOCK_ORDERS = [];

// Bersihkan cache storage versi lama
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('freonix_orders_db');
  }
} catch (e) {}

/**
 * Mengambil semua pesanan dari database localStorage
 */
export function getAllOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
      return INITIAL_MOCK_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MOCK_ORDERS;
  } catch (err) {
    console.error('Gagal mengambil orders:', err);
    return INITIAL_MOCK_ORDERS;
  }
}

/**
 * Menambahkan pesanan baru ke database (disimpan di urutan paling atas)
 */
export function addOrder(orderData) {
  try {
    const orders = getAllOrders();
    const filtered = orders.filter(o => o.orderId !== orderData.orderId);
    const updated = [orderData, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Gagal menyimpan pesanan baru:', err);
    return getAllOrders();
  }
}

/**
 * Mengubah status pembayaran pesanan (PENDING <-> SUCCESS atau CANCELLED)
 */
export function updateOrderStatus(orderId, newStatus) {
  try {
    const orders = getAllOrders();
    const updated = orders.map(order => {
      if (order.orderId === orderId) {
        return {
          ...order,
          paymentStatus: newStatus,
          orderStatus: newStatus === 'SUCCESS' ? 'Processing' : order.orderStatus
        };
      }
      return order;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Sinkronkan ke struk lokal pelanggan jika ini pesanan aktif mereka
    try {
      const activeRaw = localStorage.getItem('freonix_last_order');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active.orderId === orderId) {
          active.paymentStatus = newStatus;
          localStorage.setItem('freonix_last_order', JSON.stringify(active));
        }
      }
    } catch (e) {}

    return updated;
  } catch (err) {
    console.error('Gagal memperbarui status pesanan:', err);
    return getAllOrders();
  }
}

/**
 * Menghapus pesanan dari database
 */
export function deleteOrder(orderId) {
  try {
    const orders = getAllOrders();
    const updated = orders.filter(o => o.orderId !== orderId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Gagal menghapus pesanan:', err);
    return getAllOrders();
  }
}

/**
 * Menghitung metrik ringkasan
 */
export function getOrderStats() {
  const orders = getAllOrders();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalHarga || 0), 0);
  const pendingQris = orders.filter(o => o.paymentMethod === 'qris' && o.paymentStatus === 'PENDING').length;
  const verifiedSuccess = orders.filter(o => o.paymentStatus === 'SUCCESS').length;
  const cashPending = orders.filter(o => o.paymentMethod === 'cash').length;

  return {
    totalOrders,
    totalRevenue,
    pendingQris,
    verifiedSuccess,
    cashPending
  };
}

/**
 * Ekspor pesanan ke file CSV
 */
export function exportOrdersToCSV(orders = getAllOrders()) {
  if (!orders || orders.length === 0) {
    alert('Belum ada pesanan untuk diekspor.');
    return;
  }

  const headers = ['Order ID', 'Waktu', 'Nama', 'Kelas', 'Metode Bayar', 'Status Bayar', 'Rincian Menu', 'Total Harga', 'Catatan', 'Link Bukti Transfer'];

  const rows = orders.map(o => [
    `"${o.orderId}"`,
    `"${o.orderTime}"`,
    `"${o.name}"`,
    `"${o.kelas}"`,
    `"${o.paymentMethod.toUpperCase()}"`,
    `"${o.paymentStatus}"`,
    `"${(o.items || []).map(i => `${i.name} (x${i.qty})`).join('; ')}"`,
    `"${o.totalHarga}"`,
    `"${(o.notes || '').replace(/"/g, '""')}"`,
    `"${o.paymentProofUrl || o.paymentProofImage || '-'}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `freonix_orders_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
