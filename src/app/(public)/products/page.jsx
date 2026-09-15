'use client';

import React from 'react';
import { ShoppingBag, FileText, Sparkles, AlertCircle, Package } from 'lucide-react';
import Link from 'next/link';
import FAQ from '../../../components/FAQ';
import CountdownTimer from '../../../components/CountdownTimer';
import { useDb } from '../../../lib/useDb';

export default function Products() {
  const db = useDb();
  const activeProducts = db.getActiveProducts() || [];
  const settings = db.getSettings() || {};

  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Closed Store Banner */}
        {settings.storeStatus === 'closed' && (
          <div className="mb-10 p-5 rounded-3xl bg-rose-500/10 backdrop-blur-xl border border-rose-500/30 text-rose-900 shadow-sm flex items-center gap-3">
            <AlertCircle size={22} className="text-rose-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold block">Sesi Pre-Order Ditutup Sementara</span>
              <span className="text-rose-800">Saat ini stan FREONIX sedang tidak menerima pesanan baru. Silakan pantau pengumuman selanjutnya!</span>
            </div>
          </div>
        )}

        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#8B5742] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles size={14} />
            Katalog Kuliner & Informasi Gizi
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29] mb-4">
            Menu & Nilai Gizi
          </h2>
          <p className="text-[#4B5563] text-sm sm:text-base mb-6">
            Pilihan sajian kuliner khas Filipina olahan siswa-siswi FREONIX XII-F1 Sains. Higienis, lezat, bernutrisi terukur, dan siap dipesan!
          </p>
          <div className="flex justify-center">
            <CountdownTimer />
          </div>
        </div>

        {/* Product Cards Grid or Empty State */}
        {activeProducts.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-md mx-auto bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(93,58,41,0.06)] mb-16">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5742]/10 text-[#8B5742] flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Package size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#5D3A29] mb-1.5">Katalog Menu Bersih & Kosong</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              Seluruh menu makanan lama telah dihapus dari database. Anda dapat menambahkan menu produk baru kapan saja melalui portal Admin.
            </p>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Tambah Menu di Admin →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeProducts.map((item, index) => {
              const formattedPrice = `Rp ${Number(item.price || 0).toLocaleString('id-ID')} / ${item.unit || 'porsi'}`;

              return (
                <div 
                  key={item.id}
                  className="bg-white/75 backdrop-blur-md rounded-[2rem] border border-white/80 overflow-hidden shadow-[0_8px_30px_rgba(93,58,41,0.06)] hover:shadow-[0_16px_40px_rgba(93,58,41,0.12)] hover:-translate-y-1 transition-transform transition-shadow duration-200 flex flex-col justify-between group relative"
                >
                  <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-10" />

                  <div>
                    <div className="relative h-60 w-full overflow-hidden bg-stone-100/50 p-2">
                      <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                        <picture>
                          <source srcSet={item.image ? item.image.replace(/\.jpg$/, '.webp') : ''} type="image/webp" />
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            width="380"
                            height="240"
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" 
                          />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                        
                        {/* PO Status Pill */}
                        <div className="absolute top-3 right-3">
                          {settings.storeStatus === 'closed' ? (
                            <span className="bg-rose-500/90 text-white backdrop-blur-md text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                              PO Ditutup
                            </span>
                          ) : (
                            <span className="bg-emerald-600/90 text-white backdrop-blur-md border border-emerald-400/40 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Open PO
                            </span>
                          )}
                        </div>

                        {item.categoryName && (
                          <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {item.categoryName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="text-xl font-bold text-[#5D3A29]">
                          {item.name}
                        </h3>
                        <span className="text-sm font-extrabold text-[#8B5742] bg-white/80 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/80 shadow-xs">
                          {formattedPrice}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-4 line-clamp-2">
                        {item.desc || item.description}
                      </p>

                      {/* Mini Nutrition Pills */}
                      {Array.isArray(item.nutrition) && item.nutrition.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {item.nutrition.slice(0, 3).map((nut, nIdx) => (
                            <span 
                              key={nIdx} 
                              className="text-[10px] font-bold bg-[#8B5742]/5 text-[#5D3A29] px-2 py-0.5 rounded-full border border-[#8B5742]/15 flex items-center gap-1"
                            >
                              <span className="text-[#8B5742]">{nut.label}:</span>
                              <span>{nut.value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex flex-col gap-2.5">
                    <Link 
                      href={`/product/${encodeURIComponent(item.slug || item.id)}`}
                      className="w-full flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-[#5D3A29] hover:text-[#8B5742] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-xs hover:shadow-md border border-stone-200/80 backdrop-blur-md group/btn"
                    >
                      <FileText size={15} className="text-[#8B5742] group-hover/btn:scale-110 transition-transform" />
                      Lihat Menu & Gizi
                    </Link>

                    {settings.storeStatus === 'closed' ? (
                      <div className="w-full py-3 rounded-xl bg-stone-200/80 text-stone-500 font-bold text-xs uppercase tracking-wider text-center cursor-not-allowed">
                        PO Ditutup
                      </div>
                    ) : (
                      <Link 
                        href="/checkout"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-[0_4px_16px_rgba(139,87,66,0.3)] hover:shadow-[0_6px_22px_rgba(139,87,66,0.45)]"
                      >
                        <ShoppingBag size={16} />
                        Pesan Sekarang
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <FAQ />
      </div>
    </section>
  );
}
