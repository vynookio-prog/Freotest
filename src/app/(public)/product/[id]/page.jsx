'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ChefHat, 
  Activity, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag, 
  Package, 
  Flame, 
  ShieldCheck, 
  Droplets, 
  Wheat, 
  MessageCircle, 
  HeartHandshake, 
  Award, 
  Clock, 
  Check
} from 'lucide-react';
import { useDb } from '../../../../lib/useDb';

export default function ProductDetailPage({ params }) {
  const routeParams = useParams();
  const resolvedParams = params && typeof params.then === 'function' ? use(params) : params;
  const rawId = routeParams?.id || resolvedParams?.id;
  
  const db = useDb();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [rawId]);

  const product = db.getProductById(rawId);
  const allProducts = db.getActiveProducts() || [];
  const settings = db.getSettings() || {};

  // Fallback jika produk tidak ditemukan
  if (!product) {
    return (
      <div className="pt-28 pb-20 text-center min-h-[75vh] flex flex-col items-center justify-center px-4 max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-[#8B5742]/10 text-[#8B5742] flex items-center justify-center mb-6 shadow-inner border border-[#8B5742]/20">
          <Package size={36} />
        </div>
        <span className="text-xs font-black tracking-widest text-[#8B5742] uppercase mb-2">Informasi Menu</span>
        <h2 className="text-3xl font-black text-[#5D3A29] mb-3">Menu Tidak Ditemukan</h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-8 max-w-md">
          Menu makanan yang Anda cari mungkin telah diubah tautannya atau belum terdaftar di etalase kami.
        </p>

        {allProducts.length > 0 && (
          <div className="w-full mb-8">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
              Pilihan Menu Aktif FREONIX yang Tersedia:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {allProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${encodeURIComponent(p.slug || p.id)}`}
                  className="flex items-center gap-3 p-3 bg-white/80 hover:bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all text-left group"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#5D3A29] truncate">{p.name}</p>
                    <p className="text-[11px] font-bold text-[#8B5742]">
                      Rp {Number(p.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <ArrowLeft size={16} /> Lihat Semua Menu & Gizi
        </Link>
      </div>
    );
  }

  const formattedPrice = typeof product.price === 'number' 
    ? `Rp ${product.price.toLocaleString('id-ID')} / ${product.unit || 'porsi'}` 
    : product.price;

  const ingredients = product.ingredients && product.ingredients.length > 0 
    ? product.ingredients 
    : ['Bahan baku pilihan segar & bermutu tinggi', 'Bumbu racikan standar higienis kokurikuler'];

  const tools = product.tools && product.tools.length > 0 
    ? product.tools 
    : ['Peralatan standar memasak steril & higienis', 'Wadah saji ramah lingkungan (food-grade)'];

  const nutrition = product.nutrition && product.nutrition.length > 0 
    ? product.nutrition 
    : [
      { label: 'Kalori', value: '220 kkal' },
      { label: 'Protein', value: '12 g' },
      { label: 'Lemak', value: '8 g' },
      { label: 'Karbohidrat', value: '24 g' }
    ];

  // Helper untuk menentukan icon & tema per nutrisi
  const getNutritionMeta = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('kalori') || l.includes('energi')) {
      return {
        icon: Flame,
        color: 'text-amber-600',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        badge: 'Energi Bersih',
        desc: 'Kalori terukur untuk aktivitas harian'
      };
    }
    if (l.includes('protein')) {
      return {
        icon: ShieldCheck,
        color: 'text-emerald-600',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        badge: 'Sumber Protein',
        desc: 'Mendukung pemulihan & metabolisme'
      };
    }
    if (l.includes('lemak')) {
      return {
        icon: Droplets,
        color: 'text-rose-600',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        badge: 'Lemak Terkontrol',
        desc: 'Minyak higienis tanpa lemak jenuh berlebih'
      };
    }
    return {
      icon: Wheat,
      color: 'text-amber-700',
      bg: 'bg-amber-700/10',
      border: 'border-amber-700/20',
      badge: 'Karbohidrat Seimbang',
      desc: 'Asupan tenaga berkala'
    };
  };

  const otherProducts = allProducts.filter(p => p.id !== product.id && p.slug !== product.slug);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pb-20 pt-4 bg-[#FAFAF9] min-h-screen relative overflow-hidden animate-fade-in">
      {/* Ambient Depth Background Orbs */}
      <div className="absolute top-10 left-0 w-80 h-80 bg-[#DDA15E]/15 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#8B5742]/10 rounded-full blur-3xl translate-x-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-[#8B5742] font-bold hover:text-white hover:bg-[#8B5742] transition-all duration-200 bg-white/90 backdrop-blur-md shadow-xs border border-stone-200/80 px-4 py-2 rounded-full text-xs hover:shadow-md active:scale-95 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>Kembali ke Daftar Menu</span>
          </Link>

          {/* Quick Menu Selector Pills */}
          {allProducts.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-stone-200/60 backdrop-blur-md rounded-full border border-white/60">
              <span className="text-[10px] font-bold text-stone-500 uppercase px-2.5">Pilih Menu:</span>
              {allProducts.map((item) => {
                const isCurrent = item.id === product.id || item.slug === product.slug;
                return (
                  <Link
                    key={item.id}
                    href={`/product/${encodeURIComponent(item.slug || item.id)}`}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white shadow-xs'
                        : 'text-stone-700 hover:text-[#5D3A29] hover:bg-white/70'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Grid: Visual Showcase & Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Food Visual & Instant Order Action */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* Food Photo Showcase Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-3 sm:p-4 border border-white/90 shadow-[0_12px_40px_rgba(93,58,41,0.08)] relative overflow-hidden group">
              <div className="relative w-full h-[360px] sm:h-[420px] rounded-[2rem] overflow-hidden bg-stone-100 shadow-inner">
                <picture>
                  <source srcSet={product.image ? product.image.replace(/\.jpg$/, '.webp') : ''} type="image/webp" />
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    width="600"
                    height="600"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                </picture>

                {/* Glass Gradient Overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-sm">
                    <span>🇵🇭</span>
                    <span>Kuliner Khas Filipina</span>
                  </span>

                  {settings.storeStatus === 'closed' ? (
                    <span className="bg-rose-500/90 text-white backdrop-blur-md text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                      PO Ditutup
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md border border-emerald-400/40 text-white text-[11px] font-extrabold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Open Pre-Order
                    </span>
                  )}
                </div>

                {/* Bottom Photo Overlay */}
                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#DDA15E]/90 text-stone-900 text-[10px] font-extrabold uppercase tracking-wider mb-2 shadow-sm">
                    <Sparkles size={12} />
                    <span>{product.categoryName || 'Sajian Kokurikuler'}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                    {product.name}
                  </h1>
                </div>
              </div>

              {/* Price & Guarantee Pill */}
              <div className="mt-4 px-2 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">Harga Porsi</span>
                  <span className="text-2xl font-black text-[#5D3A29] tracking-tight">{formattedPrice}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <Award size={12} className="text-[#8B5742]" />
                    <span>Proyek Sains XII-F1</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Ordering Action Box */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-[0_8px_30px_rgba(93,58,41,0.06)] flex flex-col gap-3">
              {settings.storeStatus === 'closed' ? (
                <div className="w-full py-3.5 rounded-2xl bg-stone-200 text-stone-500 font-extrabold text-xs uppercase tracking-wider text-center cursor-not-allowed">
                  Sesi Pre-Order Ditutup Sementara
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] hover:from-[#784936] hover:to-[#4a2e20] text-white py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-[0_8px_24px_rgba(139,87,66,0.35)] hover:shadow-[0_12px_28px_rgba(139,87,66,0.5)] transition-all duration-200 active:scale-95"
                >
                  <ShoppingBag size={18} />
                  <span>Pesan Menu Ini Sekarang</span>
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2">
                {product.waLink ? (
                  <a
                    href={product.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-colors"
                  >
                    <MessageCircle size={15} className="text-emerald-600" />
                    <span>Tanya via WA</span>
                  </a>
                ) : (
                  <a
                    href={`https://wa.me/${settings.adminPhone || '6287856624994'}?text=${encodeURIComponent(`Halo FREONIX, saya ingin bertanya tentang menu ${product.name}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-colors"
                  >
                    <MessageCircle size={15} className="text-emerald-600" />
                    <span>Tanya via WA</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80 text-xs font-bold transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={15} className="text-emerald-600" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} className="text-[#8B5742]" />
                      <span>Bagikan Menu</span>
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500 font-semibold px-1">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> 100% Higienis
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Bahan Segar
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Kemasan Steril
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Rich Menu Details & Interactive Nutrition */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Story & Description Section */}
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgba(93,58,41,0.06)] relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-[#8B5742]/10 text-[#8B5742]">
                  <Info size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5742] block">Cerita Kuliner & Rasa</span>
                  <h3 className="text-lg sm:text-xl font-black text-[#5D3A29]">Tentang Hidangan Ini</h3>
                </div>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                {product.desc || product.description || 'Sajian lezat dan bernutrisi tinggi olahan siswa-siswi FREONIX XII-F1 Sains.'}
              </p>

              {/* Culinary Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-200/60">
                <div className="p-3 rounded-2xl bg-[#FAFAF9] border border-stone-200/60">
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase block mb-1">Ciri Khas</span>
                  <span className="text-xs font-bold text-[#5D3A29]">Autentik Filipina</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAFAF9] border border-stone-200/60">
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase block mb-1">Penyajian</span>
                  <span className="text-xs font-bold text-[#5D3A29]">Segar Saat Acara</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAFAF9] border border-stone-200/60">
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase block mb-1">Kualitas</span>
                  <span className="text-xs font-bold text-[#5D3A29]">Standar Food Grade</span>
                </div>
              </div>
            </div>

            {/* ATTRACTIVE NUTRITION BREAKDOWN SECTION */}
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgba(93,58,41,0.06)] relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700">
                    <Activity size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5742] block">Analisis Kokurikuler Sains</span>
                    <h3 className="text-lg sm:text-xl font-black text-[#5D3A29]">Informasi Nilai Gizi per Porsi</h3>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-[#8B5742]/10 text-[#8B5742] px-3 py-1 rounded-full border border-[#8B5742]/20">
                  Est. AKG Terukur
                </span>
              </div>

              {/* 4 Nutrition Macro Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {nutrition.map((item, idx) => {
                  const meta = getNutritionMeta(item.label);
                  const IconComponent = meta.icon;

                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl ${meta.bg} border ${meta.border} flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-600">
                          {item.label}
                        </span>
                        <IconComponent size={16} className={meta.color} />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-[#5D3A29] mb-1">
                        {item.value}
                      </div>
                      <span className="text-[10px] font-bold text-stone-500 truncate">
                        {meta.badge}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Science Note Explanatory Box */}
              <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200/80 flex items-start gap-3">
                <HeartHandshake size={18} className="text-[#8B5742] shrink-0 mt-0.5" />
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong className="text-[#5D3A29] font-bold block mb-0.5">Catatan Nutrisi Kelas XII-F1 Sains:</strong>
                  Estimasi nilai gizi dihitung berdasarkan proporsi takaran saji dan bahan baku pilihan secara saintifik, menjamin keseimbangan rasa dan kandungan nutrisi yang aman dikonsumsi.
                </p>
              </div>
            </div>

            {/* INGREDIENTS & PRODUCTION TOOLS */}
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgba(93,58,41,0.06)]">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl bg-[#8B5742]/10 text-[#8B5742]">
                  <ChefHat size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5742] block">Komposisi & Produksi</span>
                  <h3 className="text-lg sm:text-xl font-black text-[#5D3A29]">Bahan Alami & Alat Higienis</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Ingredients List */}
                <div className="p-5 rounded-2xl bg-[#FAFAF9] border border-stone-200/70">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#8B5742] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8B5742]" />
                    Bahan-Bahan Pilihan
                  </h4>
                  <ul className="space-y-2.5">
                    {ingredients.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-stone-700 flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tools & Sanitation */}
                <div className="p-5 rounded-2xl bg-[#FAFAF9] border border-stone-200/70">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#8B5742] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8B5742]" />
                    Alat & Standar Pengolahan
                  </h4>
                  <ul className="space-y-2.5">
                    {tools.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-stone-700 flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-[#8B5742] shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* EXPLORE OTHER MENUS SECTION */}
        {otherProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200/60">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-8">
              <div>
                <span className="text-xs font-black tracking-widest text-[#8B5742] uppercase block mb-1">Etalase FREONIX</span>
                <h3 className="text-2xl font-black text-[#5D3A29]">Jelajahi Menu Lezat Lainnya</h3>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-[#8B5742] hover:text-[#5D3A29] flex items-center gap-1 group"
              >
                <span>Lihat Semua ({allProducts.length} Menu)</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherProducts.map((other) => (
                <div 
                  key={other.id}
                  className="bg-white/80 backdrop-blur-md rounded-3xl p-4 border border-white/90 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-stone-100 mb-4">
                      <img 
                        src={other.image} 
                        alt={other.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Rp {Number(other.price || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <h4 className="text-base font-black text-[#5D3A29] mb-1">{other.name}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                      {other.desc || other.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/product/${encodeURIComponent(other.slug || other.id)}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#8B5742] hover:text-white text-[#5D3A29] font-bold text-xs text-center transition-colors"
                    >
                      Lihat Gizi
                    </Link>
                    <Link
                      href="/checkout"
                      className="py-2 px-3 rounded-xl bg-[#8B5742] text-white font-bold text-xs text-center hover:bg-[#5D3A29] transition-colors"
                    >
                      Pesan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
