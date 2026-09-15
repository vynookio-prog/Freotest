import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/40 backdrop-blur-2xl border-t border-white/60 py-12 px-4 sm:px-6 mt-20 relative overflow-hidden">
      {/* Top subtle highlight */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h3 className="text-xl font-black tracking-wider text-[#5D3A29]">FREONIX</h3>
          <p className="text-xs text-[#8B5742] font-semibold mt-1">
            Kelas Sains XII-F1 • "FUTURE READY TWELVE ONE AND ONLY"
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs">
          <a 
            href="https://www.instagram.com/freonix__?igsi=YzA1MDF4amhva3Qx" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 bg-white/70 hover:bg-white text-[#5D3A29] px-4 py-2 rounded-full border border-white/90 shadow-xs hover:shadow transition-all font-semibold active:scale-95"
          >
            Instagram
          </a>
          <a 
            href="https://www.tiktok.com/@duabelasefsatu1?_r=1&_t=ZS-98ZVLY09Qxh" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 bg-white/70 hover:bg-white text-[#5D3A29] px-4 py-2 rounded-full border border-white/90 shadow-xs hover:shadow transition-all font-semibold active:scale-95"
          >
            TikTok
          </a>
          <a 
            href="https://wa.link/ewddmf" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 bg-white/70 hover:bg-white text-[#5D3A29] px-4 py-2 rounded-full border border-white/90 shadow-xs hover:shadow transition-all font-semibold active:scale-95"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-stone-300/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#4B5563]">
        <div>
          © {new Date().getFullYear()} FREONIX. Hak Cipta Dilindungi Undang-Undang.
        </div>
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-1.5 text-stone-400 hover:text-[#8B5742] transition-colors py-1 px-2 rounded-lg hover:bg-white/60"
          >
            <Lock size={12} /> Portal Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
