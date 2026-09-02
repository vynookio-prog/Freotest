import React from 'react';

export default function Gallery() {
  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[#8B5742] font-bold text-xs uppercase tracking-widest block mb-2">
            Momen & Kebersamaan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29]">
            Dokumentasi Galeri
          </h2>
          <p className="text-[#4B5563] text-sm mt-2">
            Jejak kehangatan, dinamika belajar, dan proses persiapan proyek kokurikuler kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group overflow-hidden rounded-2xl shadow-md bg-stone-100 h-72 sm:h-80">
            <img 
              src="/foto-kenangan-1.jpg" 
              alt="Galeri Kegiatan 1" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <p className="text-white text-sm font-semibold tracking-wide">
                Kebersamaan XII-F1 Sains
              </p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl shadow-md bg-stone-100 h-72 sm:h-80">
            <img 
              src="/foto-kenangan-2.jpg" 
              alt="Galeri Kegiatan 2" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <p className="text-white text-sm font-semibold tracking-wide">
                Dokumentasi Persiapan Proyek
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
