import React from 'react';
import { Info, ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#DDA15E]/20 to-[#8B5742]/20 rounded-3xl blur-lg transition duration-500 group-hover:opacity-100 opacity-60"></div>
            <img 
              src="/foto-kenangan-1.jpg" 
              alt="Kenangan Kelas FREONIX" 
              className="relative rounded-2xl w-full h-[340px] sm:h-[420px] object-cover shadow-md transition duration-500 group-hover:scale-[1.01]"
            />
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-[#8B5742] font-bold text-xs uppercase tracking-widest">
              <Info size={16} /> Profil & Filosofi
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

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a 
                href="https://www.instagram.com/freonix__?igsi=YzA1MDF4amhva3Qx" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#5D3A29] text-xs font-bold transition-colors"
              >
                <ExternalLink size={14} /> Instagram Resmi
              </a>
              <a 
                href="https://www.tiktok.com/@duabelasefsatu1?_r=1&_t=ZS-98ZVLY09Qxh" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#5D3A29] text-xs font-bold transition-colors"
              >
                <ExternalLink size={14} /> TikTok Resmi
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
