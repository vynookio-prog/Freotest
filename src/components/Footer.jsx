import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from './SocialIcons';

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
        <div className="flex items-center justify-center md:justify-end gap-3 sm:gap-4">
          <a 
            href="https://www.instagram.com/freonix__?igsi=YzA1MDF4amhva3Qx" 
            target="_blank" 
            rel="noreferrer" 
            className="flex flex-col items-center justify-center gap-1.5 bg-white/70 hover:bg-white text-[#5D3A29] hover:text-[#E1306C] px-4 py-2.5 rounded-2xl border border-white/90 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group min-w-[76px]"
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
            className="flex flex-col items-center justify-center gap-1.5 bg-white/70 hover:bg-white text-[#5D3A29] hover:text-black px-4 py-2.5 rounded-2xl border border-white/90 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group min-w-[76px]"
          >
            <div className="w-6 h-6 flex items-center justify-center text-[#8B5742] group-hover:text-black group-hover:scale-115 transition-all duration-200">
              <TikTokIcon size={19} />
            </div>
            <span className="text-[11px] font-bold">TikTok</span>
          </a>
          <a 
            href="https://wa.link/ewddmf" 
            target="_blank" 
            rel="noreferrer" 
            className="flex flex-col items-center justify-center gap-1.5 bg-white/70 hover:bg-white text-[#5D3A29] hover:text-emerald-600 px-4 py-2.5 rounded-2xl border border-white/90 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group min-w-[76px]"
          >
            <div className="w-6 h-6 flex items-center justify-center text-[#8B5742] group-hover:text-emerald-600 group-hover:scale-115 transition-all duration-200">
              <WhatsAppIcon size={20} />
            </div>
            <span className="text-[11px] font-bold">WhatsApp</span>
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
