import React from 'react';
import { Info, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'FREONIX - Tentang Kami | Kelas Sains XII-F1',
  description: 'Profil & filosofi keluarga besar kelas sains XII-F1. Future Ready Twelve One and Only.',
};

export default function About() {
  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="relative group p-2 rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(93,58,41,0.08)]">
            <picture>
              <source srcSet="/foto-kenangan-1.webp" type="image/webp" />
              <img 
                src="/foto-kenangan-1.jpg" 
                alt="Kenangan Kelas FREONIX" 
                width="600"
                height="420"
                loading="lazy"
                decoding="async"
                className="rounded-[2rem] w-full h-[340px] sm:h-[420px] object-cover shadow-sm transition duration-700 group-hover:scale-[1.02]"
              />
            </picture>
          </div>

          <div className="space-y-6 bg-white/60 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-white/80 shadow-[0_20px_50px_rgba(93,58,41,0.08)] relative overflow-hidden">
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#8B5742] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Info size={14} className="text-[#DDA15E]" /> Profil & Filosofi
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29] leading-tight">
              Keluarga Besar Kelas Sains XII-F1
            </h2>
            <p className="text-[#4B5563] leading-relaxed text-sm sm:text-base">
              FREONIX bukan sekadar singkatan kelas, melainkan wujud tekad, inovasi, dan kehangatan kebersamaan. Sebagai siswa-siswi kelas sains, kami berkomitmen untuk selalu siap menghadapi masa depan dengan karya nyata, kolaborasi berkesinambungan, dan semangat pantang menyerah.
            </p>
            <p className="text-[#4B5563] leading-relaxed text-sm sm:text-base">
              Melalui proyek kokurikuler ini, kami belajar mengasah kemampuan kewirausahaan, menyajikan cita rasa autentik khas Filipina, dan mempererat tali persaudaraan.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a 
                href="https://www.instagram.com/freonix__?igsi=YzA1MDF4amhva3Qx" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 hover:bg-white text-[#5D3A29] text-xs font-bold transition-all shadow-xs border border-white/80 active:scale-95"
              >
                <ExternalLink size={14} className="text-[#8B5742]" /> Instagram Resmi
              </a>
              <a 
                href="https://www.tiktok.com/@duabelasefsatu1?_r=1&_t=ZS-98ZVLY09Qxh" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 hover:bg-white text-[#5D3A29] text-xs font-bold transition-all shadow-xs border border-white/80 active:scale-95"
              >
                <ExternalLink size={14} className="text-[#8B5742]" /> TikTok Resmi
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
