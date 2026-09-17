// src/app/admin/reviews/page.jsx
// Admin Moderation Page for Customer Ratings & Reviews

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Star, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Package
} from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useDb } from '../../../lib/useDb';

export default function AdminReviewsPage() {
  const db = useDb();
  const products = db.getActiveProducts() || [];

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'hidden'
  const [lightboxImage, setLightboxImage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      if (data?.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      showToast('Gagal memuat ulasan pelanggan.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Product name lookup map
  const productMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.id] = p.name;
      if (p.slug) map[p.slug] = p.name;
    });
    return map;
  }, [products]);

  // Metrics
  const totalCount = reviews.length;
  const activeCount = reviews.filter(r => !r.isHidden).length;
  const hiddenCount = reviews.filter(r => r.isHidden).length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : '0.0';

  // Toggle hide / unhide
  const handleToggleHide = async (review) => {
    const newHidden = !review.isHidden;
    const prevReviews = reviews;

    // Optimistic update
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, isHidden: newHidden } : r));

    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, isHidden: newHidden })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah status ulasan.');
      }
      showToast(
        newHidden 
          ? `Ulasan dari ${review.buyerName} berhasil disembunyikan dari publik.` 
          : `Ulasan dari ${review.buyerName} berhasil dipublikasikan kembali.`
      );
    } catch (err) {
      setReviews(prevReviews);
      showToast(err.message, 'error');
    }
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const pName = (productMap[r.productId] || r.productId || '').toLowerCase();
      const matchSearch = !q ||
        (r.buyerName || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q) ||
        (r.orderId || '').toLowerCase().includes(q) ||
        pName.includes(q);

      // Product (support aliases between iskrambol & buko-coklat)
      const matchProduct = productFilter === 'all' || 
        r.productId === productFilter || 
        (productFilter === 'iskrambol' && r.productId === 'buko-coklat') || 
        (productFilter === 'buko-coklat' && r.productId === 'iskrambol');

      // Rating
      const matchRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);

      // Status
      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = !r.isHidden;
      if (statusFilter === 'hidden') matchStatus = r.isHidden;

      return matchSearch && matchProduct && matchRating && matchStatus;
    });
  }, [reviews, searchQuery, productFilter, ratingFilter, statusFilter, productMap]);

  return (
    <AdminLayout title="Manajemen Ulasan & Rating">
      <div className="space-y-6 animate-fade-in">
        
        {/* Toast Alert */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-slide-up ${
            toast.type === 'error' 
              ? 'bg-rose-900/90 text-white border-rose-700' 
              : 'bg-[#5D3A29]/95 text-white border-[#8B5742]/50'
          }`}>
            <Sparkles size={18} className="text-[#DDA15E]" />
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Header & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#5D3A29] flex items-center gap-2.5">
              <Star size={26} className="text-amber-500 fill-amber-500" />
              Manajemen Ulasan & Rating ({totalCount})
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Pantau kepuasan pelanggan, moderasi komentar yang tidak pantas, dan kelola reputasi sajian FREONIX.
            </p>
          </div>

          <button
            onClick={loadReviews}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 hover:bg-white text-xs font-bold text-[#5D3A29] border border-stone-200/80 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan Data</span>
          </button>
        </div>

        {/* Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <Star size={24} className="fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Rata-rata Rating
              </span>
              <span className="text-2xl font-black text-[#5D3A29]">
                {avgRating} <span className="text-xs font-bold text-stone-400">/ 5.0</span>
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
              <MessageSquare size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Ulasan Masuk
              </span>
              <span className="text-2xl font-black text-[#5D3A29]">{totalCount}</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Tampil di Publik
              </span>
              <span className="text-2xl font-black text-emerald-700">{activeCount}</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-500/15 text-stone-600 flex items-center justify-center shrink-0">
              <EyeOff size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Disembunyikan
              </span>
              <span className="text-2xl font-black text-stone-600">{hiddenCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-xs flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pembeli, menu, komentar, atau Order ID..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 text-stone-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Product Filter */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="text-xs p-2.5 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 text-stone-700 font-semibold cursor-pointer"
            >
              <option value="all">Semua Menu</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="text-xs p-2.5 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 text-stone-700 font-semibold cursor-pointer"
            >
              <option value="all">Semua Bintang</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
              <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
              <option value="3">⭐⭐⭐ (3 Bintang)</option>
              <option value="2">⭐⭐ (2 Bintang)</option>
              <option value="1">⭐ (1 Bintang)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2.5 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 text-stone-700 font-semibold cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Ditampilkan di Publik</option>
              <option value="hidden">Disembunyikan (Dimoderasi)</option>
            </select>
          </div>
        </div>

        {/* Reviews Table Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)] overflow-hidden">
          {filteredReviews.length === 0 ? (
            <div className="py-16 text-center">
              <Star size={40} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-[#5D3A29]">Tidak ada ulasan ditemukan</h3>
              <p className="text-xs text-stone-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter ulasan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#5D3A29]/5 border-b border-stone-200/70 text-[#5D3A29] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Tanggal & Order ID</th>
                    <th className="py-3.5 px-4">Pelanggan</th>
                    <th className="py-3.5 px-4">Menu Produk</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Komentar & Foto</th>
                    <th className="py-3.5 px-4">Status Publik</th>
                    <th className="py-3.5 px-4 text-center">Aksi Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/50">
                  {filteredReviews.map((rev) => {
                    const prodName = productMap[rev.productId] || rev.productId;
                    return (
                      <tr 
                        key={rev.id} 
                        className={`hover:bg-white/80 transition-colors ${rev.isHidden ? 'bg-stone-100/60 opacity-75' : ''}`}
                      >
                        {/* Date & Order */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-[#5D3A29] block">
                            #{rev.orderId}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8B5742] to-[#DDA15E] text-white font-black text-[11px] flex items-center justify-center shrink-0">
                              {(rev.buyerName || 'P').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-stone-800 block leading-tight">
                                {rev.buyerName}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                Inisial: {rev.privacyName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-[#5D3A29] block">
                            {prodName}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            ID: {rev.productId}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                size={13} 
                                className={s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'} 
                              />
                            ))}
                            <span className="font-black text-xs text-[#5D3A29] ml-1">
                              {rev.rating}.0
                            </span>
                          </div>
                        </td>

                        {/* Comment & Photo */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {rev.comment ? (
                            <p className="text-stone-700 italic leading-relaxed text-xs">
                              &ldquo;{rev.comment}&rdquo;
                            </p>
                          ) : (
                            <span className="text-stone-400 text-[11px] italic">Tanpa komentar</span>
                          )}

                          {rev.photoUrl && (
                            <button
                              type="button"
                              onClick={() => setLightboxImage(rev.photoUrl)}
                              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-[11px] font-bold text-[#8B5742] hover:bg-stone-50 shadow-2xs cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Lihat Foto Ulasan</span>
                            </button>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {rev.isHidden ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 text-stone-700 text-[10px] font-extrabold">
                              <EyeOff size={11} /> Disembunyikan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold">
                              <CheckCircle2 size={11} className="text-emerald-600" /> Ditampilkan
                            </span>
                          )}
                        </td>

                        {/* Moderation Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleHide(rev)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 ${
                              rev.isHidden
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                            }`}
                            title={rev.isHidden ? 'Tampilkan kembali ke publik' : 'Sembunyikan dari publik'}
                          >
                            {rev.isHidden ? (
                              <>
                                <Eye size={13} />
                                <span>Tampilkan</span>
                              </>
                            ) : (
                              <>
                                <EyeOff size={13} />
                                <span>Sembunyikan</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-lg w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-stone-300 p-2"
              >
                <X size={24} />
              </button>
              <img 
                src={lightboxImage} 
                alt="Foto Ulasan" 
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl" 
              />
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
