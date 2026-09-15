import React from 'react';
import { Utensils, ImageIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'FREONIX - Beranda | Sajian Kuliner Khas Filipina',
  description: 'Selamat datang di etalase resmi FREONIX. Temukan karya kebersamaan serta sajian kuliner khas Filipina proyek kokurikuler kelas XII-F1 Sains.',
};

export default function Home() {
  return (
    <section className="pb-20 md:pb-28 px-4 sm:px-6 relative flex items-center justify-center min-h-[75vh]">
      {/* Floating Apple Liquid Glass Hero Card */}
      <div className="max-w-3xl w-full mx-auto text-center bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-8 sm:p-14 shadow-[0_20px_60px_rgba(93,58,41,0.08)] relative overflow-hidden">
        {/* Subtle Specular Top Highlight */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#8B5742] text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles size={14} className="text-[#DDA15E]" /> Kelas Sains XII-F1
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative p-3 rounded-full bg-white/50 backdrop-blur-xl border border-white/80 shadow-md">
            <img 
              src="/logo-freonix.png" 
              alt="FREONIX Logo" 
              width="128"
              height="128"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-24 w-24 sm:h-32 sm:w-32 object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#5D3A29] tracking-tight mb-3">
          FREONIX
        </h1>
        <p className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#8B5742] uppercase mb-6">
          “Future Ready Twelve One and Only”
        </p>

        <p className="max-w-lg mx-auto text-[#4B5563] text-sm sm:text-base leading-relaxed mb-10">
          Selamat datang di etalase resmi FREONIX. Temukan karya kebersamaan kami serta nikmati sajian kuliner khas Filipina hasil proyek kokurikuler kelas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/products"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-[0_8px_24px_rgba(139,87,66,0.35)] hover:shadow-[0_12px_30px_rgba(139,87,66,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
          >
            <Utensils size={18} />
            Menu & Gizi Kokurikuler
          </Link>
          <Link 
            href="/gallery"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/70 hover:bg-white text-[#5D3A29] border border-white/90 px-8 py-3.5 rounded-full font-bold text-sm shadow-sm hover:shadow active:scale-95 transition-all backdrop-blur-md"
          >
            <ImageIcon size={18} />
            Lihat Galeri
          </Link>
        </div>
      </div>
    </section>
  );
}
