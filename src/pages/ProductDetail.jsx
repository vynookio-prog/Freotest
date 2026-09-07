import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChefHat, Activity, Info, CheckCircle2, Sparkles, Droplets, Box, Image as ImageIcon, ShoppingBag, Package } from 'lucide-react';
import Product3DViewer from '../components/Product3DViewer';
import { useDb } from '../utils/useDb';

export default function ProductDetail() {
  const { id } = useParams();
  const db = useDb();
  const [viewMode, setViewMode] = useState('photo');

  // Scroll to top on mount for smooth experience
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Lookup in DB
  const product = db.getProductById(id);

  if (!product) {
    return (
      <div className="pt-28 text-center min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#8B5742]/10 text-[#8B5742] flex items-center justify-center mb-4">
          <Package size={28} />
        </div>
        <h2 className="text-2xl font-bold text-[#5D3A29]">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-sm">
          Menu produk ini belum terdaftar atau telah dihapus dari database.
        </p>
        <Link 
          to="/products" 
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B5742] text-white text-xs font-bold shadow-md hover:bg-[#5D3A29] transition-all"
        >
          <ArrowLeft size={14} /> Kembali ke Menu Produk
        </Link>
      </div>
    );
  }

  const formattedPrice = typeof product.price === 'number' 
    ? `Rp ${product.price.toLocaleString('id-ID')} / ${product.unit || 'porsi'}` 
    : product.price;

  const ingredients = product.ingredients && product.ingredients.length > 0 
    ? product.ingredients 
    : ['Bahan baku pilihan berkualitas', 'Bumbu racikan standar higienis'];

  const tools = product.tools && product.tools.length > 0 
    ? product.tools 
    : ['Peralatan standar memasak higienis', 'Wadah saji ramah lingkungan'];

  const nutrition = product.nutrition && product.nutrition.length > 0 
    ? product.nutrition 
    : [
      { label: 'Kalori', value: '200 kkal' },
      { label: 'Protein', value: '10 g' },
      { label: 'Lemak', value: '8 g' },
      { label: 'Karbohidrat', value: '25 g' }
    ];

  return (
    <div className="pb-16 bg-[#FAFAF9] min-h-[80vh] relative overflow-hidden opacity-0 animate-fade-in">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#DDA15E]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#8B5742]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 pt-4">
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-[#8B5742] font-bold hover:text-white hover:bg-[#8B5742] transition-all duration-300 mb-8 bg-white shadow-sm border border-[#8B5742]/20 px-5 py-2.5 rounded-full text-sm hover:shadow-md opacity-0 animate-slide-right group"
          style={{ animationDelay: '0.1s' }}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Menu
        </Link>
        
        <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Kolom Visual Makanan (3D & Foto) */}
          <div className="md:w-5/12 p-3 sm:p-5 flex flex-col justify-between bg-stone-900/5 border-b md:border-b-0 md:border-r border-stone-200/60">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-center p-1 bg-stone-200/70 rounded-full mb-3 max-w-[280px] mx-auto w-full">
              <button
                type="button"
                onClick={() => setViewMode('photo')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                  viewMode === 'photo'
                    ? 'bg-white text-[#5D3A29] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ImageIcon size={14} className="text-[#8B5742]" />
                Foto Asli
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                  viewMode === '3d'
                    ? 'bg-white text-[#5D3A29] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Box size={14} className="text-[#DDA15E]" />
                3D Interaktif
              </button>
            </div>

            {/* Konten Tampilan: 3D atau Foto */}
            <div className="flex-1 flex items-center justify-center">
              {viewMode === '3d' ? (
                <Product3DViewer 
                  image={product.image} 
                  name={product.name} 
                  price={formattedPrice} 
                />
              ) : (
                <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden shadow-lg group">
                  <picture>
                    <source srcSet={product.image.replace(/\.jpg$/, '.webp')} type="image/webp" />
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      width="420"
                      height="420"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Tombol Shortcut Lihat 3D di Atas Foto */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      type="button"
                      onClick={() => setViewMode('3d')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-[#DDA15E] text-xs font-bold border border-[#DDA15E]/40 shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                      <Box size={13} />
                      Lihat Versi 3D
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                      <Sparkles size={16} className="text-[#DDA15E]" />
                      <span className="text-[#DDA15E] text-xs font-bold uppercase tracking-widest">Premium Quality</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-wide drop-shadow-lg">{product.name}</h1>
                    <span className="inline-block bg-gradient-to-r from-[#DDA15E] to-[#8B5742] text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg">
                      {formattedPrice}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Info Singkat Judul di bawah jika mode 3D */}
            {viewMode === '3d' && (
              <div className="mt-3 text-center px-2">
                <h1 className="text-2xl font-black text-[#5D3A29]">{product.name}</h1>
                <p className="text-xs text-[#8B5742] font-semibold">{formattedPrice}</p>
              </div>
            )}

            {/* Pesan Sekarang Action */}
            <div className="mt-4">
              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingBag size={16} />
                Pesan di Menu Checkout
              </Link>
            </div>
          </div>

          {/* Konten Detail */}
          <div className="md:w-7/12 p-6 md:p-10 relative">
            <Droplets className="absolute top-10 right-10 text-stone-100 w-32 h-32 -z-10 rotate-12 opacity-50" />
            
            {/* Deskripsi */}
            <div className="mb-10 opacity-0 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-xl font-bold text-[#5D3A29] mb-4 flex items-center gap-2">
                <Info size={22} className="text-[#DDA15E]" /> Deskripsi Singkat
              </h3>
              <p className="text-stone-700 leading-relaxed bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-xs relative overflow-hidden">
                <span className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#DDA15E] to-[#8B5742]"></span>
                {product.desc || 'Tidak ada deskripsi tambahan.'}
              </p>
            </div>

            {/* Nilai Gizi */}
            <div className="mb-10 opacity-0 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-xl font-bold text-[#5D3A29] mb-4 flex items-center gap-2">
                <Activity size={22} className="text-[#DDA15E]" /> Estimasi Nilai Gizi
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {nutrition.map((item, i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/90 rounded-2xl p-4 text-center shadow-xs hover:shadow-md hover:border-[#DDA15E]/60 hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="text-[10px] text-stone-500 font-bold mb-1.5 uppercase tracking-widest group-hover:text-[#8B5742] transition-colors">{item.label}</div>
                    <div className="text-xl font-black text-[#8B5742]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alat dan Bahan */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <h3 className="text-xl font-bold text-[#5D3A29] mb-4 flex items-center gap-2">
                <ChefHat size={22} className="text-[#DDA15E]" /> Alat & Bahan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/45 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-xs">
                <div>
                  <h4 className="font-bold text-[#8B5742] mb-4 flex items-center gap-2 border-b-2 border-[#DDA15E]/40 pb-2 inline-block">
                    Bahan-bahan
                  </h4>
                  <ul className="space-y-3">
                    {ingredients.map((item, i) => (
                      <li key={i} className="text-sm text-stone-700 flex items-start gap-3 hover:translate-x-1 transition-transform">
                        <CheckCircle2 size={18} className="text-[#DDA15E] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-[#8B5742] mb-4 flex items-center gap-2 border-b-2 border-[#DDA15E]/40 pb-2 inline-block">
                    Alat Produksi
                  </h4>
                  <ul className="space-y-3">
                    {tools.map((item, i) => (
                      <li key={i} className="text-sm text-stone-700 flex items-start gap-3 hover:translate-x-1 transition-transform">
                        <CheckCircle2 size={18} className="text-[#DDA15E] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
