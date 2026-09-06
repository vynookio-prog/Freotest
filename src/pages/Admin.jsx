import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  User, 
  KeyRound, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Download, 
  Printer, 
  ExternalLink, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Trash2, 
  ShieldCheck, 
  RefreshCw,
  ShoppingBag,
  DollarSign,
  QrCode,
  Banknote,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  getAllOrders, 
  updateOrderStatus, 
  deleteOrder, 
  exportOrdersToCSV, 
  getOrderStats 
} from '../utils/orderStore';

export default function Admin() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('freonix_admin_auth') === 'true' || 
           localStorage.getItem('freonix_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Orders data state
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending_qris', 'success', 'cash'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProofImage, setSelectedProofImage] = useState(null); // For lightbox modal
  const [toastMessage, setToastMessage] = useState('');

  // Load orders
  useEffect(() => {
    if (isAuthenticated) {
      setOrders(getAllOrders());
    }
  }, [isAuthenticated]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Kredensial sesuai kesepakatan: freonix / Freonixx2026
    if (cleanUser === 'freonix' && cleanPass === 'Freonixx2026') {
      if (rememberMe) {
        localStorage.setItem('freonix_admin_auth', 'true');
      } else {
        sessionStorage.setItem('freonix_admin_auth', 'true');
      }
      setIsAuthenticated(true);
      setOrders(getAllOrders());
    } else {
      setLoginError('Username atau password salah. Silakan coba kembali.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('freonix_admin_auth');
    localStorage.removeItem('freonix_admin_auth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    setOrders(updated);
    showToast(`Status pesanan #${orderId} diubah menjadi ${newStatus === 'SUCCESS' ? 'LUNAS (SUCCESS)' : 'PENDING'}`);
  };

  const handleDelete = (orderId, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pesanan #${orderId} atas nama ${name}?`)) {
      const updated = deleteOrder(orderId);
      setOrders(updated);
      showToast(`Pesanan #${orderId} berhasil dihapus.`);
    }
  };

  const stats = useMemo(() => getOrderStats(orders), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
      if (activeTab === 'pending_qris') {
        if (order.paymentMethod !== 'qris' || order.paymentStatus === 'SUCCESS') return false;
      } else if (activeTab === 'success') {
        if (order.paymentStatus !== 'SUCCESS') return false;
      } else if (activeTab === 'cash') {
        if (order.paymentMethod !== 'cash') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = (order.orderId || '').toLowerCase().includes(q);
        const nameMatch = (order.name || '').toLowerCase().includes(q);
        const classMatch = (order.kelas || '').toLowerCase().includes(q);
        return idMatch || nameMatch || classMatch;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // ==========================================
  // RENDER 1: LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
        <div className="max-w-md w-full">
          {/* Apple Liquid Glass Login Card */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_24px_70px_rgba(93,58,41,0.12)] relative overflow-hidden">
            {/* Top specular highlight rim */}
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B5742] to-[#DDA15E] p-1 mx-auto mb-3 shadow-[0_8px_20px_rgba(139,87,66,0.25)] flex items-center justify-center text-white">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-2xl font-black text-[#5D3A29]">Portal Admin FREONIX</h1>
              <p className="text-xs text-stone-500 font-medium mt-1">
                Verifikasi Pembayaran QRIS & Rekap Pesanan
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-800 text-xs animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-sm shadow-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-sm shadow-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-600">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#8B5742] rounded"
                  />
                  <span>Ingat login saya</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-[0_6px_20px_rgba(139,87,66,0.3)] hover:shadow-[0_8px_25px_rgba(139,87,66,0.45)] transition-all active:scale-98"
              >
                Masuk ke Dashboard
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-200/50 text-center">
              <Link 
                to="/"
                className="text-xs text-stone-500 hover:text-[#5D3A29] font-semibold transition-colors"
              >
                ← Kembali ke Halaman Utama
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 2: ADMIN DASHBOARD (If authenticated)
  // ==========================================
  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto animate-fade-in print:p-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#5D3A29] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slide-up">
          <CheckCircle2 size={16} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#8B5742] text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
            <ShieldCheck size={13} /> Dashboard Administrator
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#5D3A29]">
            Kelola Pesanan & Verifikasi QRIS
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Periksa bukti transfer QRIS pelanggan dan ubah status menjadi Lunas secara instan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOrders(getAllOrders())}
            className="flex items-center gap-1.5 bg-white/70 hover:bg-white text-[#5D3A29] px-4 py-2.5 rounded-2xl border border-white/90 shadow-2xs text-xs font-bold transition-all active:scale-95"
            title="Muat Ulang Data"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={exportOrdersToCSV}
            className="flex items-center gap-1.5 bg-white/70 hover:bg-white text-emerald-800 px-4 py-2.5 rounded-2xl border border-white/90 shadow-2xs text-xs font-bold transition-all active:scale-95"
            title="Download CSV / Excel"
          >
            <Download size={14} /> Ekspor Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white/70 hover:bg-white text-stone-700 px-4 py-2.5 rounded-2xl border border-white/90 shadow-2xs text-xs font-bold transition-all active:scale-95"
            title="Cetak Laporan"
          >
            <Printer size={14} /> Cetak
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 px-4 py-2.5 rounded-2xl border border-rose-300/40 shadow-2xs text-xs font-bold transition-all active:scale-95"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8 print:grid-cols-5">
        {/* Total Pesanan */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/80 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Pesanan</span>
            <ShoppingBag size={16} className="text-[#8B5742]" />
          </div>
          <div className="text-2xl font-black text-[#5D3A29]">{stats.totalOrders}</div>
          <p className="text-[10px] text-stone-500 mt-1">Semua pesanan masuk</p>
        </div>

        {/* Total Estimasi Omset */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/80 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Omset</span>
            <DollarSign size={16} className="text-green-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800">
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Estimasi pendapatan</p>
        </div>

        {/* Perlu Cek QRIS (Highlighted) */}
        <div className={`rounded-3xl p-4 border shadow-sm transition-all ${
          stats.pendingQrisCount > 0 
            ? 'bg-amber-500/15 border-amber-500/40 ring-2 ring-amber-500/20' 
            : 'bg-white/60 border-white/80'
        }`}>
          <div className="flex items-center justify-between text-amber-900 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Perlu Cek QRIS</span>
            <QrCode size={16} className="text-amber-700 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-amber-900">{stats.pendingQrisCount}</div>
          <p className="text-[10px] text-amber-800 font-semibold mt-1">
            {stats.pendingQrisCount > 0 ? '⚠️ Butuh verifikasi bukti' : 'Semua QRIS beres'}
          </p>
        </div>

        {/* Lunas (Verified) */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/80 shadow-sm">
          <div className="flex items-center justify-between text-green-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Lunas (Success)</span>
            <CheckCircle2 size={16} className="text-green-600" />
          </div>
          <div className="text-2xl font-black text-green-800">{stats.successCount}</div>
          <p className="text-[10px] text-stone-500 mt-1">Pembayaran terverifikasi</p>
        </div>

        {/* Cash di Stand */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/80 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tunai di Stand</span>
            <Banknote size={16} className="text-[#5D3A29]" />
          </div>
          <div className="text-2xl font-black text-[#5D3A29]">{stats.cashCount}</div>
          <p className="text-[10px] text-stone-500 mt-1">Bayar 23 September</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#5D3A29] text-white shadow-xs'
                : 'bg-white/60 text-stone-600 hover:bg-white'
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('pending_qris')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pending_qris'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white/60 text-amber-800 hover:bg-white'
            }`}
          >
            <Clock size={12} /> Perlu Cek QRIS ({stats.pendingQrisCount})
          </button>
          <button
            onClick={() => setActiveTab('success')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'success'
                ? 'bg-green-600 text-white shadow-xs'
                : 'bg-white/60 text-green-800 hover:bg-white'
            }`}
          >
            <CheckCircle2 size={12} /> Lunas ({stats.successCount})
          </button>
          <button
            onClick={() => setActiveTab('cash')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cash'
                ? 'bg-[#8B5742] text-white shadow-xs'
                : 'bg-white/60 text-stone-600 hover:bg-white'
            }`}
          >
            <Banknote size={12} /> Tunai ({stats.cashCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID, Nama, atau Kelas..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-white/90 bg-white/80 text-xs shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 placeholder:text-stone-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/70 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#5D3A29]">Tidak ada pesanan ditemukan</h3>
          <p className="text-xs text-stone-400 mt-1">
            {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada pesanan pada kategori ini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const isQris = order.paymentMethod === 'qris';
            const isSuccess = order.paymentStatus === 'SUCCESS';

            return (
              <div 
                key={order.orderId}
                className={`bg-white/70 backdrop-blur-xl rounded-3xl p-5 border transition-all shadow-xs hover:shadow-md ${
                  isQris && !isSuccess
                    ? 'border-amber-400/80 bg-amber-50/20 ring-1 ring-amber-500/20'
                    : 'border-white/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info Utama: ID, Waktu, Pelanggan */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#8B5742] bg-[#DDA15E]/20 px-2.5 py-0.5 rounded-lg border border-[#DDA15E]/30">
                        {order.orderId}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {order.orderTime}
                      </span>

                      {/* Status Badge */}
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={11} /> Lunas (Terverifikasi)
                        </span>
                      ) : isQris ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                          <Clock size={11} /> Perlu Cek QRIS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-500/15 border border-stone-500/30 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
                          <Banknote size={11} /> Tunai di Stand
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <span className="font-black text-base text-[#5D3A29]">{order.name}</span>
                      <span className="text-xs text-stone-500 font-semibold ml-2">
                        • Kelas: <span className="text-[#8B5742] font-bold">{order.kelas}</span>
                      </span>
                      <span className="text-xs text-stone-400 ml-2">
                        • Metode: <strong className="text-stone-700">{isQris ? 'QRIS' : 'Cash (Tunai)'}</strong>
                      </span>
                    </div>

                    {/* Rincian Menu */}
                    <div className="text-xs text-stone-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                      <span className="font-bold text-stone-400 text-[11px]">Menu:</span>
                      {(order.items || []).map((item, idx) => (
                        <span key={idx} className="bg-stone-100/80 px-2 py-0.5 rounded-md font-medium text-stone-700">
                          {item.name} <strong className="text-[#5D3A29]">x{item.qty}</strong>
                        </span>
                      ))}
                    </div>

                    {/* Catatan Khusus */}
                    {order.notes && (
                      <p className="text-[11px] text-[#8B5742] bg-[#DDA15E]/10 p-2 rounded-xl border border-[#DDA15E]/20 mt-1 italic">
                        💬 Catatan: "{order.notes}"
                      </p>
                    )}
                  </div>

                  {/* Bagian Bukti Transfer & Nominal */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-200/50">
                    {/* Thumbnail Bukti Transfer QRIS */}
                    {isQris && (
                      <div className="flex items-center gap-2">
                        {order.paymentProofImage || order.paymentProofUrl ? (
                          <div 
                            onClick={() => setSelectedProofImage(order.paymentProofUrl || order.paymentProofImage)}
                            className="relative w-16 h-14 rounded-xl overflow-hidden border border-stone-300 shadow-2xs cursor-pointer hover:opacity-80 transition-opacity bg-stone-100 group shrink-0"
                            title="Klik untuk memperbesar bukti transfer"
                          >
                            <img 
                              src={order.paymentProofImage || order.paymentProofUrl} 
                              alt="Bukti Transfer" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye size={14} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-14 rounded-xl border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center text-[10px] text-stone-400 text-center px-1">
                            Tanpa Foto
                          </div>
                        )}

                        {order.paymentProofUrl && (
                          <a
                            href={order.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-stone-100 hover:bg-white text-stone-600 border border-stone-200/70 transition-all text-xs"
                            title="Buka File Gambar di Tab Baru"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Total Harga */}
                    <div className="text-right min-w-[110px]">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Total Tagihan</span>
                      <span className="text-lg font-black text-[#8B5742]">
                        Rp {(order.totalHarga || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Tombol Aksi Status & WA */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {!isSuccess ? (
                        <button
                          onClick={() => handleStatusChange(order.orderId, 'SUCCESS')}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 whitespace-nowrap"
                        >
                          <CheckCircle2 size={14} /> Setujui (Lunas)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(order.orderId, 'PENDING')}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border border-amber-500/40 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap"
                          title="Kembalikan status ke Pending"
                        >
                          <Clock size={14} /> Pendingkan
                        </button>
                      )}

                      {/* Tombol Chat WA Pembeli */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Halo ${order.name}, pesanan Anda (${order.orderId}) di FREONIX telah ${isSuccess ? 'LUNAS TERVERIFIKASI' : 'KAMI TERIMA'}. Silakan tunjukkan nomor pesanan saat pengambilan di stand pada 23 September 2026. Terima kasih!`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-2xl bg-white hover:bg-stone-50 text-emerald-600 border border-stone-200/80 shadow-2xs transition-all active:scale-95"
                        title="Kirim Konfirmasi ke WhatsApp"
                      >
                        <MessageSquare size={16} />
                      </a>

                      {/* Hapus Pesanan */}
                      <button
                        onClick={() => handleDelete(order.orderId, order.name)}
                        className="p-2.5 rounded-2xl bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200/80 shadow-2xs transition-all active:scale-95"
                        title="Hapus Pesanan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal for Payment Proof Photo */}
      {selectedProofImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedProofImage(null)}
        >
          <div 
            className="bg-white/90 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-6 max-w-lg w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 mb-4">
              <h3 className="font-bold text-sm text-[#5D3A29] flex items-center gap-2">
                <QrCode size={16} className="text-[#8B5742]" /> Bukti Transfer QRIS Pelanggan
              </h3>
              <button 
                onClick={() => setSelectedProofImage(null)}
                className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="w-full max-h-[65vh] overflow-hidden rounded-2xl border border-stone-200 shadow-inner bg-stone-100 flex items-center justify-center">
              <img 
                src={selectedProofImage} 
                alt="Bukti Transfer Penuh" 
                className="w-full h-full max-h-[60vh] object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <a
                href={selectedProofImage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5742] hover:underline"
              >
                <ExternalLink size={13} /> Buka Gambar di Tab Baru
              </a>
              <button
                onClick={() => setSelectedProofImage(null)}
                className="px-5 py-2 rounded-xl bg-[#5D3A29] text-white font-bold text-xs transition-all active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
