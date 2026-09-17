import React from 'react';
import { Utensils, ImageIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { GradientBackground } from '@/components/ui/pipo';
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from '../../components/SocialIcons';
import FAQ from '../../components/FAQ';

export const metadata = {
  title: 'FREONIX - Beranda | Sajian Kuliner Khas Filipina',
  description: 'Selamat datang di etalase resmi FREONIX. Temukan karya kebersamaan serta sajian kuliner khas Filipina proyek kokurikuler kelas XII-F1 Sains.',
};

export default function Home() {
  return (
    <>
      {/* Hero Section & Terhubung Bersama Kami dalam Satu Frame Terpadu dengan Efek Glassmorphism */}
      <section className="pb-12 md:pb-16 px-4 sm:px-6 relative flex flex-col items-center justify-center">
        {/* Satu Frame Kartu Terpadu Glassmorphism */}
        <div className="relative max-w-3xl w-full mx-auto text-center rounded-[2.5rem] p-8 sm:p-14 shadow-[0_25px_65px_rgba(93,58,41,0.12)] border border-white/80 overflow-hidden ring-1 ring-black/5">
          {/* Gradient Palette di Layer Paling Belakang */}
          <GradientBackground className="absolute inset-0" />

          {/* Frosted Glass Translucent Sheen Layer */}
          <div className="absolute inset-0 bg-white/25 backdrop-blur-[2px] pointer-events-none z-0" />

          {/* Subtle Specular Top Highlight khas Liquid Glass */}
          <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none z-10" />

          {/* Konten Utama Hero */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Glass Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-xl border border-white/90 text-[#3D2314] text-xs font-bold uppercase tracking-wider mb-8 shadow-xs">
              <Sparkles size={14} className="text-[#C9A227]" /> Kelas Sains XII-F1
            </div>
            
            {/* Glass Logo Frame */}
            <div className="flex justify-center mb-6">
              <div className="relative p-3.5 sm:p-4 rounded-full bg-white/60 backdrop-blur-2xl border border-white/90 shadow-[0_12px_36px_rgba(93,58,41,0.08)]">
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

            <h1 className="text-4xl sm:text-6xl font-black text-[#3D2314] tracking-tight mb-3">
              FREONIX
            </h1>
            <p className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#5C3A21] uppercase mb-6">
              “Future Ready Twelve One and Only”
            </p>

            <p className="max-w-lg mx-auto text-[#3D2314] font-medium text-sm sm:text-base leading-relaxed mb-10">
              Selamat datang di etalase resmi FREONIX. Temukan karya kebersamaan kami serta nikmati sajian kuliner khas Filipina hasil proyek kokurikuler kelas.
            </p>

            {/* Tombol CTA dengan Sentuhan Glass & Gradient */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link 
                href="/products"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] hover:from-[#784936] hover:to-[#4a2e20] text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-[0_8px_24px_rgba(139,87,66,0.35)] hover:shadow-[0_12px_30px_rgba(139,87,66,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
              >
                <Utensils size={18} />
                Menu & Gizi Kokurikuler
              </Link>
              <Link 
                href="/gallery"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/75 hover:bg-white backdrop-blur-xl text-[#3D2314] border border-white/90 px-8 py-3.5 rounded-full font-bold text-sm shadow-xs hover:shadow active:scale-95 transition-all"
              >
                <ImageIcon size={18} />
                Lihat Galeri
              </Link>
            </div>

            {/* Bagian Terhubung Bersama Kami: Glassmorphism Card */}
            <div className="mt-12 pt-10 border-t border-stone-300/60 w-full">
              <p className="text-xs font-extrabold text-[#5C3A21] uppercase tracking-wider mb-5">
                Terhubung Bersama Kami
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <a 
                  href="https://www.instagram.com/freonix__?igsi=YzA1MDF4amhva3Qx" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/70 hover:bg-white/95 backdrop-blur-xl text-[#5D3A29] hover:text-[#E1306C] border border-white/90 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group min-w-[80px]"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-[#8B5742] group-hover:text-[#E1306C] group-hover:scale-115 transition-all duration-200">
                    <InstagramIcon size={20} />
                  </div>
                  <span className="text-[11px] font-bold">Instagram</span>
                </a>

                <a 
                  href="https://www.tiktok.com/@duabelasefsatu1?_r=1&_t=ZS-98ZVLY09Qxh" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/70 hover:bg-white/95 backdrop-blur-xl text-[#5D3A29] hover:text-black border border-white/90 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group min-w-[80px]"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-[#8B5742] group-hover:text-black group-hover:scale-115 transition-all duration-200">
                    <TikTokIcon size={19} />
                  </div>
                  <span className="text-[11px] font-bold">TikTok</span>
                </a>

                <a 
                  href="https://wa.me/628818578363" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/70 hover:bg-white/95 backdrop-blur-xl text-[#5D3A29] hover:text-emerald-600 border border-white/90 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group min-w-[80px]"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-[#8B5742] group-hover:text-emerald-600 group-hover:scale-115 transition-all duration-200">
                    <WhatsAppIcon size={20} />
                  </div>
                  <span className="text-[11px] font-bold">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ di Bawah Frame Utama */}
      <section className="pb-20 md:pb-28 px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <FAQ />
      </section>
    </>
  );
}
