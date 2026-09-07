// src/utils/orderStore.js
// Centralized order store & state management for FREONIX (Integrated with db.js & Supabase)

import { db } from './db';

/**
 * Mengambil semua pesanan dari database terpadu (Supabase via in-memory cache)
 */
export function getAllOrders() {
  return db.getOrders();
}

/**
 * Menambahkan pesanan baru ke database (async, Supabase-first)
 */
export async function addOrder(orderData) {
  try {
    const existing = db.getOrderById(orderData.orderId || orderData.id);
    if (existing) {
      return getAllOrders();
    }
    await db.createOrder(orderData);
    return getAllOrders();
  } catch (err) {
    console.error('Gagal menyimpan pesanan baru:', err);
    return getAllOrders();
  }
}

/**
 * Mengubah status pembayaran pesanan (PENDING <-> SUCCESS atau CANCELLED)
 */
export async function updateOrderStatus(orderId, newStatus) {
  try {
    await db.updatePaymentStatus(orderId, newStatus);
    return getAllOrders();
  } catch (err) {
    console.error('Gagal memperbarui status pesanan:', err);
    return getAllOrders();
  }
}

/**
 * Menghapus pesanan dari database
 */
export async function deleteOrder(orderId) {
  try {
    await db.deleteOrder(orderId);
    return getAllOrders();
  } catch (err) {
    console.error('Gagal menghapus pesanan:', err);
    return getAllOrders();
  }
}

/**
 * Menghitung metrik ringkasan pesanan
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
    `"${o.orderId || o.id}"`,
    `"${o.orderTime}"`,
    `"${o.name}"`,
    `"${o.kelas}"`,
    `"${(o.paymentMethod || 'qris').toUpperCase()}"`,
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
