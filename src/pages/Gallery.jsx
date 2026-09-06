import React from 'react';

export default function Gallery() {
  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#8B5742] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            Momen & Kebersamaan
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29]">
            Dokumentasi Galeri
          </h2>
          <p className="text-[#4B5563] text-sm mt-2">
            Jejak kehangatan, dinamika belajar, dan proses persiapan proyek kokurikuler kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-2.5 rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(93,58,41,0.08)] group overflow-hidden">
            <div className="relative rounded-[2rem] overflow-hidden h-72 sm:h-80 bg-stone-100">
              <img 
                src="/foto-kenangan-1.jpg" 
                alt="Galeri Kegiatan 1" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div className="px-4 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white text-xs font-bold">
                  Kebersamaan XII-F1 Sains
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(93,58,41,0.08)] group overflow-hidden">
            <div className="relative rounded-[2rem] overflow-hidden h-72 sm:h-80 bg-stone-100">
              <img 
                src="/foto-kenangan-2.jpg" 
                alt="Galeri Kegiatan 2" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div className="px-4 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white text-xs font-bold">
                  Dokumentasi Persiapan Proyek
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
