'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  FileText, 
  AlertCircle, 
  Package, 
  ArrowRight 
} from 'lucide-react';
import FAQ from '../../../components/FAQ';
import { useDb } from '../../../lib/useDb';

export default function ProductsPage() {
  const db = useDb();
  const activeProducts = db.getActiveProducts() || [];
  const settings = db.getSettings() || {};

  // Format Rupiah
  const formatRupiah = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

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
            MENU GRID (Active Products with Direct Checkout Links)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {activeProducts.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-[2rem] overflow-hidden border border-stone-200/80 hover:border-stone-300 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5"
              >
                <div>
                  {/* Image Area */}
                  <div className="relative h-52 w-full overflow-hidden bg-stone-100">
                    <img 
                      src={item.image || `/images/${item.id}.jpg`} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        if (!e.target.dataset.triedLocal) {
                          e.target.dataset.triedLocal = 'true';
                          e.target.src = `/images/${item.id || item.slug}.jpg`;
                        } else {
                          e.target.src = '/logo-freonix.png';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Category Badge */}
                    {item.categoryName && (
                      <div className="absolute bottom-3 left-3 bg-black/45 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {item.categoryName}
                      </div>
                    )}
                  </div>

                  {/* Card Information */}
                  <div className="p-5 text-center flex flex-col items-center">
                    <h3 className="text-lg font-bold font-heading text-stone-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                      {item.description || item.desc}
                    </p>
                    <div className="flex items-baseline justify-center gap-1.5 mb-3">
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
                        href={`/product/${encodeURIComponent(item.slug || item.id)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5742] hover:text-[#5D3A29] py-1.5 px-4 rounded-full bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                      >
                        <FileText size={13} />
                        <span>Lihat Nilai Gizi & Resep</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>

                    {/* DIRECT KE MENU CHECKOUT DI BAWAH NILAI GIZI */}
                    <div className="w-full pt-3 border-t border-stone-100">
                      <Link
                        href="/checkout"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] hover:from-[#784936] hover:to-[#4a2e20] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                        <ShoppingBag size={15} />
                        <span>Langsung ke Menu Checkout</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIRECT TO CHECKOUT PROMO CARD */}
        <div className="bg-gradient-to-r from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]/60 rounded-3xl p-6 sm:p-8 border border-amber-300/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 mb-16">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#5D3A29] text-white flex items-center justify-center shadow-md shrink-0">
              <ShoppingBag size={26} />
            </div>
            <div>
              <h3 className="font-heading font-black text-stone-900 text-lg sm:text-xl mb-1">
                Sudah Menentukan Pilihan Menu?
              </h3>
              <p className="text-xs sm:text-sm text-stone-700">
                Pesan sekarang lewat menu checkout resmi untuk kemudahan pembayaran QRIS atau Cash.
              </p>
            </div>
          </div>
          <Link
            href="/checkout"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] hover:from-[#784936] hover:to-[#4a2e20] text-white font-heading font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 shrink-0"
          >
            <ShoppingBag size={18} />
            <span>Buka Halaman Checkout</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* FAQ Section */}
        <FAQ />
      </div>
    </section>
  );
}
