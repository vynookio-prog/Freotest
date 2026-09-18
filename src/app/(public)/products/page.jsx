'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  FileText, 
  AlertCircle, 
  Package, 
  ArrowRight,
  Star,
  CheckCircle2,
  X
} from 'lucide-react';
import { useDb } from '../../../lib/useDb';

const MENU_ORDER = ['rice-bowl', 'kwek-kwek', 'turon', 'iskrambol', 'buko-coklat'];

export default function ProductsPage() {
  const db = useDb();
  const rawActiveProducts = db.getActiveProducts() || [];
  const activeProducts = useMemo(() => {
    return [...rawActiveProducts].sort((a, b) => {
      const aKey = (a.id || a.slug || '').toLowerCase();
      const bKey = (b.id || b.slug || '').toLowerCase();
      let aIdx = MENU_ORDER.findIndex(k => aKey.includes(k) || k.includes(aKey));
      let bIdx = MENU_ORDER.findIndex(k => bKey.includes(k) || k.includes(bKey));
      if (aIdx === -1) aIdx = 99;
      if (bIdx === -1) bIdx = 99;
      return aIdx - bIdx;
    });
  }, [rawActiveProducts]);
  const settings = db.getSettings() || {};

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [lightboxImage, setLightboxImage] = useState(null);

  // Fetch reviews from API
  useEffect(() => {
    let isMounted = true;
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.success) {
          setReviews(data.reviews || []);
        }
      })
      .catch(err => {
        console.warn('Gagal memuat ulasan:', err);
      })
      .finally(() => {
        if (isMounted) setReviewsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Format Rupiah
  const formatRupiah = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  // Product Name Dictionary for fast lookup
  const productMap = {
    'buko-coklat': 'Iskrambol',
    'iskrambol': 'Iskrambol',
    'kwek-kwek': 'Kwek Kwek',
    'turon': 'Turon',
    'rice-bowl': 'Rice Bowl',
    'chicken-adobo': 'Rice Bowl'
  };
  activeProducts.forEach(p => {
    productMap[p.id] = p.name;
    if (p.slug) productMap[p.slug] = p.name;
  });

  // Calculate review stats for each product
  const getProductStats = (prod) => {
    const cleanId = (prod.id || '').toLowerCase();
    const cleanSlug = (prod.slug || '').toLowerCase();
    const aliases = (cleanId === 'iskrambol' || cleanId === 'buko-coklat' || cleanSlug === 'iskrambol')
      ? ['buko-coklat', 'iskrambol']
      : [cleanId, cleanSlug];

    const matched = reviews.filter(r => 
      aliases.includes(String(r.productId || '').trim().toLowerCase()) && !r.isHidden
    );

    const count = matched.length;
    const avg = count > 0 
      ? (matched.reduce((acc, cur) => acc + cur.rating, 0) / count).toFixed(1)
      : '5.0';

    return { count, avg, matched };
  };

  // Overall reviews stats
  const activeReviews = reviews.filter(r => !r.isHidden);
  const overallReviewCount = activeReviews.length;
  const overallAvgRating = overallReviewCount > 0
    ? (activeReviews.reduce((sum, r) => sum + r.rating, 0) / overallReviewCount).toFixed(1)
    : '5.0';

  // Filtered reviews for the review showcase section
  const displayedReviews = activeReviews.filter(r => {
    if (selectedProductFilter === 'all') return true;
    const cleanId = selectedProductFilter.toLowerCase();
    const aliases = (cleanId === 'iskrambol' || cleanId === 'buko-coklat')
      ? ['buko-coklat', 'iskrambol']
      : [cleanId];
    return aliases.includes(String(r.productId || '').trim().toLowerCase());
  });

  return (
    <section className="py-10 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Closed Store Banner */}
        {settings.storeStatus === 'closed' && (
          <div className="mb-8 p-5 rounded-3xl bg-rose-500/10 backdrop-blur-xl border border-rose-500/30 text-rose-900 shadow-sm flex items-center gap-3">
            <AlertCircle size={22} className="text-rose-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold block">Sesi Pre-Order Ditutup Sementara</span>
              <span className="text-rose-800">Saat ini stan FREONIX sedang tidak menerima pesanan baru. Silakan pantau pengumuman selanjutnya!</span>
            </div>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#8B5742] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="text-sm">🇵🇭</span>
            <span>ASEAN KOKURIKULER &middot; FREONIX XII-F1</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-[#5D3A29] mb-3">
            Menu & Gizi Masakan Filipina
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Sajian khas kepulauan Filipina yang diolah segar, higienis, dan bernutrisi terukur oleh siswa-siswi kelas XII-F1 Sains.
          </p>
        </div>

        {/* =====================================================================
            MENU GRID (Active Products with Direct Checkout Links & Review Badges)
            ===================================================================== */}
        {activeProducts.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-md mx-auto bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(93,58,41,0.06)] mb-16">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5742]/10 text-[#8B5742] flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Package size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#5D3A29] mb-1.5">Katalog Menu Kosong</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              Menu sedang dipersiapkan di database.
            </p>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white text-xs font-extrabold shadow-md"
            >
              Kelola di Admin →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {activeProducts.map((item) => {
              const targetSlug = encodeURIComponent(item.slug || item.id);

              return (
                <div 
                  key={item.id}
                  className="bg-white/70 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/80 hover:border-white transition-all duration-300 flex flex-col justify-between shadow-[0_8px_30px_rgba(93,58,41,0.06)] hover:shadow-[0_20px_50px_rgba(93,58,41,0.14)] hover:-translate-y-1.5 group"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative h-52 w-full overflow-hidden bg-stone-100/50">
                      <img 
                        src={item.image || `/images/${item.id}.jpg`} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          if (!e.target.dataset.triedLocal) {
                            e.target.dataset.triedLocal = 'true';
                            e.target.src = `/images/${item.id || item.slug}.jpg`;
                          } else {
                            e.target.src = '/logo-freonix.png';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                      {/* Subtle Specular Top Highlight */}
                      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

                      {/* Category & Origin Badge */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        {item.categoryName && (
                          <div className="bg-black/45 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {item.categoryName}
                          </div>
                        )}
                        {(item.id === 'rice-bowl' || (item.name || '').toLowerCase().includes('rice bowl')) && (
                          <div className="bg-black/45 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>🇯🇵</span>
                            <span>Autentik Japan</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Information */}
                    <div className="p-5 text-center flex flex-col items-center">
                      <h3 className="text-lg font-bold font-heading text-[#5D3A29] mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                        {item.description || item.desc}
                      </p>
                      <div className="flex items-baseline justify-center gap-1.5 mb-4">
                        <span className="text-xl font-black font-heading text-[#DDA15E]">
                          {formatRupiah(item.price)}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">
                          / {item.unit || 'porsi'}
                        </span>
                      </div>

                      {/* Link to Detail Nilai Gizi */}
                      <div className="mb-4">
                        <Link 
                          href={`/product/${targetSlug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5742] hover:text-[#5D3A29] py-1.5 px-4 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 shadow-2xs transition-colors"
                        >
                          <FileText size={13} />
                          <span>Lihat Nilai Gizi & Resep</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>

                      {/* DIRECT KE MENU CHECKOUT DI BAWAH NILAI GIZI */}
                      <div className="w-full pt-3 border-t border-stone-200/60">
                        <Link
                          href={`/checkout?item=${encodeURIComponent(item.slug || item.id)}`}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] hover:from-[#784936] hover:to-[#4a2e20] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          <ShoppingBag size={15} />
                          <span>Langsung ke Menu Checkout</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =====================================================================
            CUSTOMER REVIEWS SHOWCASE SECTION
            ===================================================================== */}
        <div id="reviews" className="mb-16 bg-white/75 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-white/90 shadow-[0_16px_50px_rgba(93,58,41,0.08)] scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <Star size={24} className="fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5742] block">
                  Kepuasan & Suara Pelanggan
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#5D3A29]">
                  Ulasan Menu Produk FREONIX
                </h2>
              </div>
            </div>

            {/* Overall Rating Score Card */}
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-amber-500/25 shadow-xs shrink-0">
              <div className="text-3xl font-black text-[#5D3A29]">
                {overallAvgRating}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={14} 
                      className={s <= Math.round(Number(overallAvgRating || 5)) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} 
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-stone-600 block">
                  {overallReviewCount} Ulasan Pembeli Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Filter Pills per Menu */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedProductFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedProductFilter === 'all'
                  ? 'bg-[#8B5742] text-white shadow-xs'
                  : 'bg-white/70 hover:bg-white/95 backdrop-blur-md border border-white/80 text-stone-600'
              }`}
            >
              Semua Menu ({activeReviews.length})
            </button>
            {activeProducts.map((p) => {
              const count = activeReviews.filter(r => {
                const cleanId = (p.id || '').toLowerCase();
                const aliases = (cleanId === 'iskrambol' || cleanId === 'buko-coklat')
                  ? ['buko-coklat', 'iskrambol']
                  : [cleanId];
                return aliases.includes(String(r.productId || '').trim().toLowerCase());
              }).length;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProductFilter(p.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    selectedProductFilter === p.id
                      ? 'bg-[#8B5742] text-white shadow-xs'
                      : 'bg-white/70 hover:bg-white/95 backdrop-blur-md border border-white/80 text-stone-600'
                  }`}
                >
                  {p.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Review Grid or Empty State */}
          {reviewsLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Memuat ulasan pelanggan...
            </div>
          ) : displayedReviews.length === 0 ? (
            <div className="py-12 px-4 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-dashed border-stone-300">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Star size={22} className="fill-amber-400 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-[#5D3A29] mb-1">
                Belum Ada Ulasan untuk Kategori Ini
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed mb-5">
                Setiap pesanan yang disetujui dapat langsung dinilai melalui struk digital atau pop-up status pesanan di halaman checkout.
              </p>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B5742] hover:bg-[#784936] text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <ShoppingBag size={14} /> Pesan Menu Sekarang
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedReviews.map((rev) => {
                const pName = productMap[rev.productId] || 'Menu Produk';

                return (
                  <div 
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/85 hover:border-white shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: User & Rating */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B5742] to-[#DDA15E] text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {(rev.privacyName || rev.buyerName || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-[#5D3A29] block">
                              {rev.privacyName || rev.buyerName}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold inline-flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-600" /> Pembeli Terverifikasi
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star 
                              key={st} 
                              size={13} 
                              className={st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Menu Purchased Badge */}
                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-[#8B5742] bg-[#8B5742]/10 px-2 py-0.5 rounded-md">
                          Menu: {pName}
                        </span>
                      </div>

                      {/* Comment */}
                      {rev.comment ? (
                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal mb-3">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400 italic mb-3">
                          Memberikan penilaian bintang {rev.rating}/5 untuk menu ini.
                        </p>
                      )}

                      {/* Photo Thumbnail if available */}
                      {rev.photoUrl && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setLightboxImage(rev.photoUrl)}
                            className="relative group rounded-xl overflow-hidden border border-stone-200 shadow-2xs hover:ring-2 hover:ring-[#8B5742] transition-all cursor-pointer inline-block"
                            title="Klik untuk melihat foto ulasan pembeli"
                          >
                            <img 
                              src={rev.photoUrl} 
                              alt="Foto sajian pembeli" 
                              className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-200/50 flex items-center justify-between text-[10px] text-stone-400">
                      <span>Pesanan #{rev.orderId}</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PHOTO LIGHTBOX MODAL */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center">
              <button 
                onClick={() => setLightboxImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-stone-300 p-1"
                title="Tutup pratinjau"
              >
                <X size={24} />
              </button>
              <img 
                src={lightboxImage} 
                alt="Foto Ulasan Pembeli" 
                className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/20"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
