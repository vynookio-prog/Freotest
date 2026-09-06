import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  ExternalLink, 
  MessageSquare, 
  Download, 
  Trash2, 
  QrCode, 
  Banknote, 
  X, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Check
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useDb } from '../../utils/useDb';

export default function AdminOrders() {
  const db = useDb();
  const orders = db.getOrders() || [];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'PENDING', 'SUCCESS', 'qris_pending', 'cash'
  
  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        order.orderId?.toLowerCase().includes(query) ||
        order.name?.toLowerCase().includes(query) ||
        order.kelas?.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query) ||
        order.notes?.toLowerCase().includes(query) ||
        (order.items || []).some(item => item.name?.toLowerCase().includes(query));

      // Status match
      const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

      // Payment match
      let matchPayment = true;
      if (paymentFilter === 'PENDING') matchPayment = order.paymentStatus === 'PENDING';
      else if (paymentFilter === 'SUCCESS') matchPayment = order.paymentStatus === 'SUCCESS';
      else if (paymentFilter === 'qris_pending') matchPayment = order.paymentMethod === 'qris' && order.paymentStatus === 'PENDING';
      else if (paymentFilter === 'cash') matchPayment = order.paymentMethod === 'cash';

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  // Statistics
  const pendingQrisCount = orders.filter(o => o.paymentMethod === 'qris' && o.paymentStatus === 'PENDING').length;
  const pendingCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const processingCount = orders.filter(o => o.orderStatus === 'Processing').length;
  const completedCount = orders.filter(o => o.orderStatus === 'Completed').length;

  // Handlers
  const handleVerifyPayment = (orderId, newStatus) => {
    db.updatePaymentStatus(orderId, newStatus);
    showToast(`Pembayaran #${orderId} berhasil diubah ke ${newStatus}!`);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder(prev => ({ ...prev, paymentStatus: newStatus }));
    }
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    db.updateOrderStatus(orderId, newStatus, `Diubah ke ${newStatus} via Admin`);
    showToast(`Status pesanan #${orderId} diubah ke ${newStatus}!`);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
    }
  };

  const handleDeleteOrder = (orderId) => {
    db.deleteOrder(orderId);
    setDeleteConfirmId(null);
    if (selectedOrder?.orderId === orderId) setSelectedOrder(null);
    showToast(`Pesanan #${orderId} telah dihapus.`, 'info');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      showToast('Tidak ada data pesanan untuk diekspor.', 'error');
      return;
    }

    const headers = ['Order ID', 'Tanggal', 'Nama Pelanggan', 'Kelas', 'WhatsApp', 'Metode Bayar', 'Status Bayar', 'Status Pesanan', 'Item Pesanan', 'Total Harga', 'Catatan', 'Bukti Transfer'];
    const rows = filteredOrders.map(o => [
      `"${o.orderId}"`,
      `"${o.orderTime || '-'}"`,
      `"${o.name || '-'}"`,
      `"${o.kelas || '-'}"`,
      `"${o.phone || '-'}"`,
      `"${o.paymentMethod?.toUpperCase() || '-'}"`,
      `"${o.paymentStatus || '-'}"`,
      `"${o.orderStatus || '-'}"`,
      `"${(o.items || []).map(i => `${i.name} (x${i.qty})`).join('; ')}"`,
      `"${o.totalHarga || 0}"`,
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
    showToast('Data pesanan berhasil diekspor ke CSV!');
  };

  // WhatsApp Reply Helper
  const getWhatsAppReplyLink = (order) => {
    let cleanPhone = (order.phone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;

    const isLunas = order.paymentStatus === 'SUCCESS';
    const statusNote = isLunas 
      ? '✅ PEMBAYARAN TERVERIFIKASI LUNAS' 
      : (order.paymentMethod === 'cash' ? '💵 PEMBAYARAN TUNAI (CASH DI STAND)' : '⏳ MENUNGGU PEMBAYARAN / VERIFIKASI');

    const message = `Halo kak ${order.name} (${order.kelas}),\n\n` +
      `Terima kasih telah memesan kuliner khas Filipina di *FREONIX*!\n` +
      `ID Pesanan: *#${order.orderId}*\n` +
      `Status Bayar: *${statusNote}*\n` +
      `Status Pesanan: *${order.orderStatus}*\n\n` +
      `Rincian Pesanan:\n` +
      (order.items || []).map(i => `• ${i.name} x${i.qty} = Rp ${(i.price * i.qty).toLocaleString('id-ID')}`).join('\n') +
      `\n*Total Tagihan: Rp ${(order.totalHarga || 0).toLocaleString('id-ID')}*\n\n` +
      (isLunas 
        ? `Pesanan kakak sedang disiapkan. Harap ambil pesanan di stand FREONIX saat waktu istirahat/jam acara ya. Terima kasih! ✨`
        : `Silakan tunjukkan pesan ini atau selesaikan pembayaran di stand FREONIX saat pengambilan pesanan ya! Sampai jumpa! 😊`);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <AdminLayout title="Manajemen Pesanan">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-slide-up ${
          toast.type === 'error' 
            ? 'bg-rose-900/90 text-white border-rose-700' 
            : toast.type === 'info'
            ? 'bg-stone-900/90 text-white border-stone-700'
            : 'bg-[#5D3A29]/95 text-white border-[#8B5742]/50'
        }`}>
          <Sparkles size={18} className="text-[#DDA15E]" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header with quick metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#5D3A29] flex items-center gap-2.5">
            <ShoppingCart size={26} className="text-[#8B5742]" />
            Manajemen Pesanan ({orders.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Pantau, verifikasi pembayaran QRIS, update status pesanan, dan koordinasi dengan pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 border border-stone-200/80 text-[#5D3A29] text-xs font-bold hover:bg-white transition-all shadow-sm active:scale-95"
          >
            <Download size={15} className="text-[#8B5742]" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Quick Action Badges / KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => { setPaymentFilter('qris_pending'); setStatusFilter('all'); }}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            paymentFilter === 'qris_pending'
              ? 'bg-amber-500/15 border-amber-400/80 ring-2 ring-amber-400/30'
              : 'bg-white/60 border-white/80 hover:bg-white/90'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-800 block">QRIS Pending</span>
            <span className="text-lg font-black text-amber-900">{pendingQrisCount} Pesanan</span>
          </div>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${pendingQrisCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-stone-100 text-stone-400'}`}>
            <QrCode size={16} />
          </div>
        </button>

        <button
          onClick={() => { setStatusFilter('Pending'); setPaymentFilter('all'); }}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            statusFilter === 'Pending'
              ? 'bg-blue-500/15 border-blue-400/80 ring-2 ring-blue-400/30'
              : 'bg-white/60 border-white/80 hover:bg-white/90'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-800 block">Status Pending</span>
            <span className="text-lg font-black text-blue-900">{pendingCount} Pesanan</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Clock size={16} />
          </div>
        </button>

        <button
          onClick={() => { setStatusFilter('Processing'); setPaymentFilter('all'); }}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            statusFilter === 'Processing'
              ? 'bg-purple-500/15 border-purple-400/80 ring-2 ring-purple-400/30'
              : 'bg-white/60 border-white/80 hover:bg-white/90'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-800 block">Diproses</span>
            <span className="text-lg font-black text-purple-900">{processingCount} Pesanan</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <RotateCcw size={16} />
          </div>
        </button>

        <button
          onClick={() => { setStatusFilter('Completed'); setPaymentFilter('all'); }}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            statusFilter === 'Completed'
              ? 'bg-emerald-500/15 border-emerald-400/80 ring-2 ring-emerald-400/30'
              : 'bg-white/60 border-white/80 hover:bg-white/90'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Selesai</span>
            <span className="text-lg font-black text-emerald-900">{completedCount} Pesanan</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)] mb-6 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari ID Pesanan, Nama, Kelas, No HP, atau Nama Produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border border-stone-200/70 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Processing', label: 'Diproses' },
            { id: 'Shipped', label: 'Dikirim' },
            { id: 'Completed', label: 'Selesai' },
            { id: 'Cancelled', label: 'Batal' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#5D3A29] text-white shadow-sm'
                  : 'bg-white/60 text-stone-600 hover:bg-white/90'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Payment Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2.5 rounded-2xl bg-white/80 border border-stone-200/70 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30"
        >
          <option value="all">Semua Pembayaran</option>
          <option value="qris_pending">⚠️ QRIS (Pending Cek)</option>
          <option value="SUCCESS">✅ Sudah Lunas (SUCCESS)</option>
          <option value="PENDING">⏳ Belum Bayar (PENDING)</option>
          <option value="cash">💵 Tunai / Cash</option>
        </select>
      </div>

      {/* Orders List Table */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)] overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart size={40} className="mx-auto text-stone-300 mb-3" />
            <h3 className="text-sm font-bold text-[#5D3A29]">Tidak ada pesanan ditemukan</h3>
            <p className="text-xs text-stone-400 mt-1">Coba ganti filter pencarian atau tunggu pelanggan memesan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#5D3A29]/5 border-b border-stone-200/70 text-[#5D3A29] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Waktu</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Item Dipesan</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Metode & Bukti</th>
                  <th className="py-3.5 px-4">Status Bayar</th>
                  <th className="py-3.5 px-4">Status Pesanan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/50">
                {filteredOrders.map((order) => {
                  const proofImg = order.paymentProofUrl || order.paymentProofImage;
                  const isQrisPending = order.paymentMethod === 'qris' && order.paymentStatus === 'PENDING';

                  return (
                    <tr key={order.orderId} className={`hover:bg-white/80 transition-colors ${isQrisPending ? 'bg-amber-500/5' : ''}`}>
                      {/* ID & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#5D3A29] flex items-center gap-1.5">
                          <span>#{order.orderId}</span>
                          {isQrisPending && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium block mt-0.5">
                          {order.orderTime || '-'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-800">{order.name}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 font-semibold">{order.kelas}</span>
                          {order.phone && (
                            <span className="text-[10px] text-stone-400 font-mono">{order.phone}</span>
                          )}
                        </div>
                        {order.notes && (
                          <div className="text-[10px] text-amber-800 italic mt-1 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200/50 max-w-[200px] truncate" title={order.notes}>
                            "{order.notes}"
                          </div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[220px]">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-700 font-medium truncate mr-2">{item.name}</span>
                              <span className="font-bold text-[#8B5742] shrink-0">x{item.qty}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-black text-[#5D3A29] whitespace-nowrap">
                        Rp {Number(order.totalHarga || 0).toLocaleString('id-ID')}
                      </td>

                      {/* Payment Method & Proof */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
                            order.paymentMethod === 'qris'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {order.paymentMethod === 'qris' ? <QrCode size={11} /> : <Banknote size={11} />}
                            {order.paymentMethod?.toUpperCase()}
                          </span>

                          {/* Proof thumbnail if available */}
                          {proofImg ? (
                            <button
                              onClick={() => setLightboxImage(proofImg)}
                              className="relative group w-8 h-8 rounded-lg overflow-hidden border border-stone-300/80 shadow-xs hover:ring-2 hover:ring-[#8B5742] transition-all"
                              title="Klik untuk perbesar bukti transfer"
                            >
                              <img 
                                src={proofImg} 
                                alt="Bukti" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Eye size={11} />
                              </div>
                            </button>
                          ) : order.paymentMethod === 'qris' ? (
                            <span className="text-[10px] text-stone-400 italic">Tanpa foto</span>
                          ) : null}
                        </div>
                      </td>

                      {/* Payment Status Switcher */}
                      <td className="py-3.5 px-4">
                        {order.paymentStatus === 'SUCCESS' ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>LUNAS</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200/80">
                              <Clock size={12} />
                              <span>PENDING</span>
                            </span>
                            <button
                              onClick={() => handleVerifyPayment(order.orderId, 'SUCCESS')}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs active:scale-95 transition-all"
                              title="Verifikasi Pembayaran LUNAS"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Order Status Select */}
                      <td className="py-3.5 px-4">
                        <select
                          value={order.orderStatus || 'Pending'}
                          onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 ${
                            order.orderStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.orderStatus === 'Processing'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-stone-50 text-stone-800 border-stone-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Diproses</option>
                          <option value="Shipped">Dikirim/Siap</option>
                          <option value="Completed">Selesai</option>
                          <option value="Cancelled">Dibatalkan</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Detail Modal */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#5D3A29] hover:bg-stone-50 transition-colors shadow-xs"
                            title="Lihat Detail Pesanan"
                          >
                            <Eye size={14} />
                          </button>

                          {/* WhatsApp Direct Reply */}
                          {order.phone && (
                            <a
                              href={getWhatsAppReplyLink(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-xs"
                              title="Kirim Konfirmasi ke WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}

                          {/* Delete Order */}
                          <button
                            onClick={() => setDeleteConfirmId(order.orderId)}
                            className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-xs"
                            title="Hapus Pesanan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lightbox Modal for QRIS Proof Image */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h4 className="font-bold text-sm text-[#5D3A29] flex items-center gap-2">
                <QrCode size={16} className="text-[#8B5742]" />
                Bukti Transfer QRIS Pelanggan
              </h4>
              <button 
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 max-h-[70vh] overflow-auto flex items-center justify-center bg-stone-100 rounded-2xl p-2">
              <img 
                src={lightboxImage} 
                alt="Bukti Transfer Penuh" 
                className="max-h-[60vh] w-auto object-contain rounded-xl shadow-md" 
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <a
                href={lightboxImage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200"
              >
                <ExternalLink size={13} />
                Buka di Tab Baru
              </a>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-4 py-2 rounded-xl bg-[#5D3A29] text-white text-xs font-bold hover:bg-[#8B5742]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Order Drawer / Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="relative max-w-xl w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl p-6 animate-scale-up my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-[#5D3A29]">
                    Detail Pesanan #{selectedOrder.orderId}
                  </h3>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    selectedOrder.paymentStatus === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">Diterima pada {selectedOrder.orderTime || '-'}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="my-4 p-4 rounded-2xl bg-[#5D3A29]/5 border border-stone-200/80">
              <h4 className="text-xs font-extrabold text-[#5D3A29] uppercase tracking-wider mb-2">
                Informasi Pelanggan
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px]">Nama Lengkap</span>
                  <span className="font-bold text-stone-800">{selectedOrder.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Kelas</span>
                  <span className="font-bold text-stone-800">{selectedOrder.kelas}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Nomor WhatsApp</span>
                  <span className="font-bold text-stone-800 font-mono">{selectedOrder.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Metode Pembayaran</span>
                  <span className="font-bold text-stone-800 uppercase">{selectedOrder.paymentMethod}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="mt-3 pt-3 border-t border-stone-200/60 text-xs">
                  <span className="text-stone-400 block text-[11px]">Catatan Khusus:</span>
                  <p className="font-medium text-amber-900 italic mt-0.5">"{selectedOrder.notes}"</p>
                </div>
              )}
            </div>

            {/* Items Breakdown */}
            <div className="mb-4">
              <h4 className="text-xs font-extrabold text-[#5D3A29] uppercase tracking-wider mb-2">
                Rincian Menu Dipesan
              </h4>
              <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-stone-50/50">
                    <div>
                      <span className="font-bold text-stone-800 block">{item.name}</span>
                      <span className="text-stone-400 text-[11px]">Rp {Number(item.price || 0).toLocaleString('id-ID')} x {item.qty}</span>
                    </div>
                    <span className="font-black text-[#5D3A29]">
                      Rp {Number((item.price || 0) * (item.qty || 1)).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                <div className="p-3 bg-white flex items-center justify-between text-xs font-black">
                  <span className="text-stone-800">Total Pembayaran</span>
                  <span className="text-[#8B5742] text-sm">
                    Rp {Number(selectedOrder.totalHarga || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* QRIS Proof Image (if any) */}
            {(selectedOrder.paymentProofUrl || selectedOrder.paymentProofImage) && (
              <div className="mb-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                <span className="text-stone-400 block text-[11px] mb-2 font-bold uppercase">Bukti Bayar QRIS:</span>
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedOrder.paymentProofUrl || selectedOrder.paymentProofImage} 
                    alt="Bukti Transfer" 
                    className="w-20 h-20 object-cover rounded-xl border border-stone-300 cursor-pointer shadow-sm"
                    onClick={() => setLightboxImage(selectedOrder.paymentProofUrl || selectedOrder.paymentProofImage)}
                  />
                  <div className="space-y-1.5">
                    <p className="text-stone-600 text-xs">Klik gambar untuk melihat resolusi penuh.</p>
                    {selectedOrder.paymentStatus === 'PENDING' ? (
                      <button
                        onClick={() => handleVerifyPayment(selectedOrder.orderId, 'SUCCESS')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                      >
                        <CheckCircle2 size={14} />
                        Verifikasi Lunas Sekarang
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 size={14} /> Sudah Diverifikasi Lunas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline History */}
            {selectedOrder.history && selectedOrder.history.length > 0 && (
              <div className="mb-4 text-xs">
                <h4 className="text-[11px] font-extrabold text-[#5D3A29] uppercase tracking-wider mb-2">
                  Riwayat Status
                </h4>
                <div className="space-y-2 border-l-2 border-[#8B5742]/30 pl-3 ml-2">
                  {selectedOrder.history.map((h, i) => (
                    <div key={i} className="relative">
                      <div className="w-2 h-2 rounded-full bg-[#8B5742] absolute -left-[17px] top-1.5" />
                      <div className="font-bold text-stone-700">{h.status} <span className="text-stone-400 font-normal text-[10px]">({h.time})</span></div>
                      {h.note && <div className="text-stone-500 text-[11px]">{h.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
              {selectedOrder.phone ? (
                <a
                  href={getWhatsAppReplyLink(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all shadow-md"
                >
                  <MessageSquare size={15} />
                  Hubungi via WhatsApp
                </a>
              ) : <div />}

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-2xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-center font-black text-[#5D3A29] text-base mb-1">
              Hapus Pesanan #{deleteConfirmId}?
            </h3>
            <p className="text-center text-xs text-stone-500 mb-6">
              Pesanan ini akan dihapus dari database. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-2xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
