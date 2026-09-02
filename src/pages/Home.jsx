import React from 'react';
import { Utensils, ImageIcon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="pb-20 md:pb-28 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center min-h-[70vh]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DDA15E]/15 border border-[#DDA15E]/30 text-[#8B5742] text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles size={14} className="text-[#DDA15E]" /> Kelas Sains XII-F1
        </div>
        
        <div className="flex justify-center mb-6">
          <img 
            src="https://cdn.phototourl.com/free/2026-09-02-4a88c19c-cba9-4d03-8a00-53eab79ada72.png" 
            alt="FREONIX Logo" 
            className="h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
          />
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#5D3A29] tracking-tight mb-4">
          FREONIX
        </h1>
        <p className="text-sm sm:text-base md:text-lg font-semibold tracking-widest text-[#8B5742] uppercase mb-8">
          “Future Ready Twelve One and Only”
        </p>

        <p className="max-w-xl mx-auto text-[#4B5563] text-sm sm:text-base leading-relaxed mb-10">
          Selamat datang di etalase resmi FREONIX. Temukan karya kebersamaan kami serta nikmati sajian kuliner khas Filipina hasil proyek kokurikuler kelas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/products"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8B5742] hover:bg-[#5D3A29] text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Utensils size={18} />
            Produk Kokurikuler
          </Link>
          <Link 
            to="/gallery"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-[#5D3A29] border border-stone-200 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-95"
          >
            <ImageIcon size={18} />
            Lihat Galeri
          </Link>
        </div>
      </div>
    </section>
  );
}
